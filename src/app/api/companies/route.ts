import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Company from "@/models/Company";
import Question from "@/models/Question";
import { requireAdmin } from "@/lib/auth";
import { companySchema } from "@/lib/validations/company";
import { companyQuerySchema, escapeRegex } from "@/lib/validations/query";
import { validateCsrfOrigin } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });

    const validation = companyQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { search, page, limit, sort } = validation.data;

    await dbConnect();

    // Prevent unused import warnings while ensuring model registration
    void Question;

    const filter: Record<string, unknown> = {};
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const sortOptions: Record<string, 1 | -1> =
      sort === "latest"
        ? { createdAt: -1, _id: -1 }
        : sort === "oldest"
        ? { createdAt: 1, _id: 1 }
        : { name: 1, _id: 1 };

    const skip = (page - 1) * limit;

    const [total, companies] = await Promise.all([
      Company.countDocuments(filter),
      Company.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const companyIds = companies.map((c) => c._id);
    const questionCountsAgg =
      companyIds.length > 0
        ? await Question.aggregate<{ _id: unknown; count: number }>([
            { $match: { companies: { $in: companyIds } } },
            { $unwind: "$companies" },
            { $match: { companies: { $in: companyIds } } },
            { $group: { _id: "$companies", count: { $sum: 1 } } },
          ])
        : [];

    const countMap = new Map<string, number>();
    for (const item of questionCountsAgg) {
      if (item._id) {
        countMap.set(String(item._id), item.count);
      }
    }

    const companiesWithCount = companies.map((c) => ({
      ...c,
      questionCount: countMap.get(String(c._id)) || 0,
    }));

    const totalPages = Math.ceil(total / limit) || 0;

    return NextResponse.json({
      success: true,
      data: companiesWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Companies GET] ${error.name}: ${error.message}`);
    } else {
      console.error("[Companies GET] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch companies" },
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

    const validation = companySchema.safeParse(body);
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

    const existingCompany = await Company.findOne({ slug: validation.data.slug });
    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: "A company with this slug already exists" },
        { status: 409 }
      );
    }

    const company = await Company.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: company,
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
        { success: false, error: "A company with this slug already exists" },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      console.error(`[Companies POST] ${error.name}: ${error.message}`);
    } else {
      console.error("[Companies POST] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to create company" },
      { status: 500 }
    );
  }
}
