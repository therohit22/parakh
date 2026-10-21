import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
import QuestionNote from "@/models/QuestionNote";
import { requireAuth } from "@/lib/auth";
import { slugParamSchema } from "@/lib/validations/auth";
import { noteSchema } from "@/lib/validations/question";
import { validateCsrfOrigin } from "@/lib/security";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { slug } = await params;
    const slugValidation = slugParamSchema.safeParse(slug);
    if (!slugValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    await dbConnect();

    const question = await Question.findOne({ slug: slugValidation.data }).select("_id").lean();
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const note = await QuestionNote.findOne({
      user: auth.user.userId,
      question: question._id,
    }).lean();

    return NextResponse.json(
      {
        success: true,
        note: note
          ? {
              id: note._id.toString(),
              content: note.content,
              updatedAt: note.updatedAt,
            }
          : null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Notes GET] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch question note" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const csrfCheck = validateCsrfOrigin(request);
    if (!csrfCheck.valid) {
      return NextResponse.json(
        { success: false, error: csrfCheck.error },
        { status: csrfCheck.status || 403 }
      );
    }

    const auth = requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { slug } = await params;
    const slugValidation = slugParamSchema.safeParse(slug);
    if (!slugValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validation = noteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const question = await Question.findOne({ slug: slugValidation.data }).select("_id").lean();
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const note = await QuestionNote.findOneAndUpdate(
      { user: auth.user.userId, question: question._id },
      { content: validation.data.content },
      { returnDocument: "after", upsert: true }
    );

    return NextResponse.json({
      success: true,
      note: {
        id: note._id.toString(),
        content: note.content,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Notes PUT] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to save question note" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const csrfCheck = validateCsrfOrigin(request);
    if (!csrfCheck.valid) {
      return NextResponse.json(
        { success: false, error: csrfCheck.error },
        { status: csrfCheck.status || 403 }
      );
    }

    const auth = requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { slug } = await params;
    const slugValidation = slugParamSchema.safeParse(slug);
    if (!slugValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    await dbConnect();

    const question = await Question.findOne({ slug: slugValidation.data }).select("_id").lean();
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    await QuestionNote.deleteOne({
      user: auth.user.userId,
      question: question._id,
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Notes DELETE] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete question note" },
      { status: 500 }
    );
  }
}
