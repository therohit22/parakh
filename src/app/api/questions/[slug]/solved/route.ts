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

    const today = new Date().toISOString().slice(0, 10);
    const user = await User.findById(auth.user.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const alreadySolved = (user.solvedQuestions || []).some(
      (id) => id.toString() === question._id.toString()
    );

    if (!alreadySolved) {
      user.solvedQuestions = user.solvedQuestions || [];
      user.solvedQuestions.push(question._id);

      user.activityLog = user.activityLog || [];
      const entry = user.activityLog.find((e) => e.date === today);
      if (entry) {
        entry.count += 1;
      } else {
        user.activityLog.push({ date: today, count: 1 });
      }
      await user.save();
    }

    return NextResponse.json({
      success: true,
      solved: true,
      questionId: question._id.toString(),
      slug: question.slug,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Solved POST] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question Solved POST] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to mark question as solved" },
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
      { $pull: { solvedQuestions: question._id } }
    );

    return NextResponse.json({
      success: true,
      solved: false,
      questionId: question._id.toString(),
      slug: question.slug,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Solved DELETE] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question Solved DELETE] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to remove solved status" },
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
    const isSolved = (user?.solvedQuestions || []).some(
      (id) => id.toString() === question._id.toString()
    );

    return NextResponse.json({
      success: true,
      solved: isSolved,
      questionId: question._id.toString(),
      slug: question.slug,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question Solved GET] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question Solved GET] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to check solved status" },
      { status: 500 }
    );
  }
}
