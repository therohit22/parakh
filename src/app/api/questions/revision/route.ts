import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import Company from "@/models/Company";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    await dbConnect();

    // Prevent unused import lint warnings while ensuring Mongoose model registration
    void Question;
    void Company;

    const user = await User.findById(auth.user.userId)
      .populate({
        path: "revisionQuestions",
        populate: {
          path: "companies",
          select: "name slug logo",
        },
      })
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Filter out any referenced questions that might have been deleted
    const questions = (user.revisionQuestions || []).filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        count: questions.length,
        questions,
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
      console.error(`[Revision Questions GET] ${error.name}: ${error.message}`);
    } else {
      console.error("[Revision Questions GET] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch revision questions" },
      { status: 500 }
    );
  }
}
