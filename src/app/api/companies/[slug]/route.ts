import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Company from "@/models/Company";
import Question from "@/models/Question";
import { requireAdmin } from "@/lib/auth";
import { companyUpdateSchema } from "@/lib/validations/company";
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

    const company = await Company.findOne({ slug: normalizedSlug }).lean();

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    const questionCount = await Question.countDocuments({ companies: company._id });

    return NextResponse.json({
      success: true,
      data: {
        ...company,
        questionCount,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Company GET by slug] ${error.name}: ${error.message}`);
    } else {
      console.error("[Company GET by slug] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch company" },
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

    const validation = companyUpdateSchema.safeParse(body);
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

    const company = await Company.findOne({ slug: normalizedSlug });
    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // Check slug collision if slug is being updated
    if (validation.data.slug && validation.data.slug !== normalizedSlug) {
      const existing = await Company.findOne({ slug: validation.data.slug });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A company with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await Company.findOneAndUpdate({ slug: normalizedSlug }, validation.data, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

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
        { success: false, error: "A company with this slug already exists" },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      console.error(`[Company PUT] ${error.name}: ${error.message}`);
    } else {
      console.error("[Company PUT] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to update company" },
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

    const company = await Company.findOne({ slug: normalizedSlug });
    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // Referential integrity guard: block deletion with HTTP 409 Conflict if any questions
    // still reference this company's ObjectId, preventing orphan references in question documents.
    const isReferenced = await Question.exists({ companies: company._id });
    if (isReferenced) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete company because questions still reference it",
        },
        { status: 409 }
      );
    }

    await Company.deleteOne({ _id: company._id });

    return NextResponse.json({
      success: true,
      data: { message: "Company deleted successfully" },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Company DELETE] ${error.name}: ${error.message}`);
    } else {
      console.error("[Company DELETE] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
