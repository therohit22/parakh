import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Company from "@/models/Company";
import Question from "@/models/Question";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    await dbConnect();

    // Prevent unused import warnings while ensuring model registration
    void Company;
    void Question;
    void User;

    const [totalCompanies, totalQuestions, totalUsers] = await Promise.all([
      Company.countDocuments(),
      Question.countDocuments(),
      User.countDocuments(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalCompanies,
          totalQuestions,
          totalUsers,
        },
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
      console.error(`[Admin Stats GET] ${error.name}: ${error.message}`);
    } else {
      console.error("[Admin Stats GET] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
