import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { slugParamSchema } from "@/lib/validations/auth";
import { validateCsrfOrigin } from "@/lib/security";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
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
        { success: false, error: slugValidation.error.issues[0]?.message || "Invalid slug parameter" },
        { status: 400 }
      );
    }
    const normalizedSlug = slugValidation.data;

    await dbConnect();

    const question = await Question.findOne({ slug: normalizedSlug });
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    await User.updateOne(
      { _id: auth.user.userId },
      { $addToSet: { revisionQuestions: question._id } }
    );

    return NextResponse.json({
      success: true,
      needsRevision: true,
      questionId: question._id.toString(),
      slug: question.slug,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Revision POST] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question Revision POST] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to update revision status" },
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
        { success: false, error: slugValidation.error.issues[0]?.message || "Invalid slug parameter" },
        { status: 400 }
      );
    }
    const normalizedSlug = slugValidation.data;

    await dbConnect();

    const question = await Question.findOne({ slug: normalizedSlug });
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    await User.updateOne(
      { _id: auth.user.userId },
      { $pull: { revisionQuestions: question._id } }
    );

    return NextResponse.json({
      success: true,
      needsRevision: false,
      questionId: question._id.toString(),
      slug: question.slug,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Revision DELETE] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question Revision DELETE] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to remove from revision queue" },
      { status: 500 }
    );
  }
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
        { success: false, error: slugValidation.error.issues[0]?.message || "Invalid slug parameter" },
        { status: 400 }
      );
    }
    const normalizedSlug = slugValidation.data;

    await dbConnect();

    const question = await Question.findOne({ slug: normalizedSlug });
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(auth.user.userId);
    const needsRevision = (user?.revisionQuestions || []).some(
      (id) => id.toString() === question._id.toString()
    );

    return NextResponse.json({
      success: true,
      needsRevision,
      questionId: question._id.toString(),
      slug: question.slug,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Revision GET] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question Revision GET] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to check revision status" },
      { status: 500 }
    );
  }
}
