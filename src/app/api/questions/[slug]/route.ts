import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
// Ensure Company model is imported for Mongoose population
import Company from "@/models/Company";
import { requireAdmin } from "@/lib/auth";
import { questionUpdateSchema } from "@/lib/validations/question";
import { slugParamSchema } from "@/lib/validations/auth";
import { validateCsrfOrigin } from "@/lib/security";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
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

    // Prevent unused import lint error while ensuring model registration
    void Company;

    const question = await Question.findOne({ slug: normalizedSlug })
      .populate("companies", "name slug logo")
      .lean();

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const relatedQuestions = await Question.find({
      _id: { $ne: question._id },
      $or: [
        { topics: { $in: question.topics || [] } },
        ...(question.pattern ? [{ pattern: question.pattern }] : []),
      ],
    })
      .select("_id title slug difficulty topics pattern")
      .limit(4)
      .lean();

    return NextResponse.json({
      success: true,
      data: question,
      relatedQuestions,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question GET by slug] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question GET by slug] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch question" },
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

    const auth = requireAdmin(request);
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validation = questionUpdateSchema.safeParse(body);
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

    const question = await Question.findOne({ slug: normalizedSlug });
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Check slug collision if slug is being updated
    if (validation.data.slug && validation.data.slug !== normalizedSlug) {
      const existing = await Question.findOne({ slug: validation.data.slug });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A question with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Verify referenced companies if companies array is being updated
    if (validation.data.companies && validation.data.companies.length > 0) {
      const uniqueCompanyIds = [...new Set(validation.data.companies)];
      const companyCount = await Company.countDocuments({
        _id: { $in: uniqueCompanyIds },
      });
      if (companyCount !== uniqueCompanyIds.length) {
        return NextResponse.json(
          { success: false, error: "One or more referenced companies do not exist" },
          { status: 400 }
        );
      }
    }

    const updated = await Question.findOneAndUpdate({ slug: normalizedSlug }, validation.data, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("companies", "name slug logo")
      .lean();

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "A question with this slug already exists" },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      console.error(`[Question PUT] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question PUT] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to update question" },
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

    const auth = requireAdmin(request);
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

    await Question.deleteOne({ _id: question._id });

    return NextResponse.json({
      success: true,
      data: { message: "Question deleted successfully" },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Question DELETE] ${error.name}: ${error.message}`);
    } else {
      console.error("[Question DELETE] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
