import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";

export async function GET() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection instance is undefined");
    }

    await db.admin().ping();

    return NextResponse.json(
      { ok: true, database: "connected" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[DB Health Check] ${error.name}: ${error.message}`);
    } else {
      console.error("[DB Health Check] Unknown error occurred");
    }

    return NextResponse.json(
      { ok: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}
