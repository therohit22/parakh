import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import QuestionNote from "@/models/QuestionNote";
import { requireAuth, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { deleteAccountSchema } from "@/lib/validations/auth";
import { validateCsrfOrigin } from "@/lib/security";

export async function DELETE(request: Request) {
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validation = deleteAccountSchema.safeParse(body);
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

    const user = await User.findById(auth.user.userId).select("+password");
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const passwordMatch = await bcrypt.compare(validation.data.password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 400 }
      );
    }

    // Delete user's private notes and user document safely
    await QuestionNote.deleteMany({ user: auth.user.userId });
    await User.findByIdAndDelete(auth.user.userId);

    const response = NextResponse.json({
      success: true,
      message: "Account and associated personal data deleted successfully",
    });

    // Clear auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Account Delete] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
