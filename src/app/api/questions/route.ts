import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
// Ensure Company model is imported for Mongoose population
import Company from "@/models/Company";
import { requireAdmin } from "@/lib/auth";
import { questionSchema } from "@/lib/validations/question";
import { questionQuerySchema, escapeRegex } from "@/lib/validations/query";
import { validateCsrfOrigin } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });

    const validation = questionQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { search, difficulty, topic, pattern, company, page, limit, sort } =
      validation.data;

    await dbConnect();

    // Prevent unused import lint error while ensuring Company model registration for population
    void Company;

    const filter: Record<string, unknown> = {};

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (topic && topic.trim()) {
      const safeTopic = escapeRegex(topic.trim());
      filter.topics = { $regex: new RegExp(`^${safeTopic}$`, "i") };
    }

    if (pattern && pattern.trim()) {
      const safePattern = escapeRegex(pattern.trim());
      filter.pattern = { $regex: new RegExp(`^${safePattern}$`, "i") };
    }

    if (company && company.trim()) {
      const companySlug = company.trim().toLowerCase();
      const companyDoc = await Company.findOne({ slug: companySlug })
        .select("_id")
        .lean();

      if (!companyDoc) {
        // Controlled empty result when referenced company filter does not exist
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      filter.companies = companyDoc._id;
    }

    const sortOptions: Record<string, 1 | -1> =
      sort === "latest"
        ? { createdAt: -1, _id: -1 }
        : sort === "oldest"
        ? { createdAt: 1, _id: 1 }
        : { title: 1, _id: 1 };

    const skip = (page - 1) * limit;

    const [total, questions] = await Promise.all([
      Question.countDocuments(filter),
      Question.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("companies", "name slug logo")
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;

    return NextResponse.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Questions GET] ${error.name}: ${error.message}`);
    } else {
      console.error("[Questions GET] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validation = questionSchema.safeParse(body);
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

    const existingQuestion = await Question.findOne({ slug: validation.data.slug });
    if (existingQuestion) {
      return NextResponse.json(
        { success: false, error: "A question with this slug already exists" },
        { status: 409 }
      );
    }

    // Verify all referenced companies exist
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

    const question = await Question.create(validation.data);
    await question.populate("companies", "name slug logo");

    return NextResponse.json(
      {
        success: true,
        data: question,
      },
      { status: 201 }
    );
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
      console.error(`[Questions POST] ${error.name}: ${error.message}`);
    } else {
      console.error("[Questions POST] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to create question" },
      { status: 500 }
    );
  }
}
