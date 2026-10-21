import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import Question from "@/models/Question";
import Bookmark from "@/models/Bookmark";
import Progress from "@/models/Progress";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    await dbConnect();

    const modelEntries = [
      { name: "User", model: User },
      { name: "Company", model: Company },
      { name: "Question", model: Question },
      { name: "Bookmark", model: Bookmark },
      { name: "Progress", model: Progress },
    ] as const;

    const modelsData: Record<
      string,
      { indexes: string[]; count: number }
    > = {};

    for (const { name, model } of modelEntries) {
      await model.init();
      const rawIndexes = await model.listIndexes();
      const indexNames = rawIndexes.map((idx) => idx.name);
      const count = await model.estimatedDocumentCount();

      modelsData[name] = {
        indexes: indexNames,
        count,
      };
    }

    return NextResponse.json({
      ok: true,
      models: modelsData,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Models Health Check] ${error.name}: ${error.message}`);
    } else {
      console.error("[Models Health Check] Unknown error occurred");
    }

    return NextResponse.json(
      { ok: false, error: "Database inspection failed" },
      { status: 500 }
    );
  }
}
