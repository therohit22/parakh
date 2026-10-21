import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { dbConnect } from "../../src/lib/db.ts";
import { runIngestion, printReport } from "./importer.ts";
import type { EntityType } from "./types.ts";

interface ProcessWithEnvFile {
  loadEnvFile?: (path: string) => void;
}

// 1. Load environment variables from .env.local or .env if present
try {
  const proc = process as unknown as ProcessWithEnvFile;
  if (typeof proc.loadEnvFile === "function") {
    if (fs.existsSync(".env.local")) {
      proc.loadEnvFile(".env.local");
    } else if (fs.existsSync(".env")) {
      proc.loadEnvFile(".env");
    }
  }
} catch {
  // Ignore env file load error if env is already supplied via environment
}

function printUsage(): void {
  console.log(`
Parakh Data Ingestion CLI (Day 11)

Usage:
  npm run ingest -- <file> [options]

Arguments:
  <file>                    Path to CSV (.csv) or JSON (.json) input file.

Options:
  --type=<companies|questions>
                            Specify entity type to import. Optional if can be detected.
  --dry-run                 Simulate the import, validate records and references without writing to DB.
  --help                    Show this help message.

Examples:
  npm run ingest -- data/companies.csv --type=companies
  npm run ingest -- data/questions.json --type=questions
  npm run ingest -- data/questions.csv --type=questions --dry-run
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
  }

  let filePath = "";
  let entityType: EntityType | undefined;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--type=")) {
      const val = arg.split("=")[1].toLowerCase();
      if (val === "companies" || val === "company") {
        entityType = "companies";
      } else if (val === "questions" || val === "question") {
        entityType = "questions";
      } else {
        console.error(`Error: Invalid entity type "${val}". Expected "companies" or "questions".`);
        process.exit(1);
      }
    } else if (arg === "--type" && i + 1 < args.length) {
      const val = args[++i].toLowerCase();
      if (val === "companies" || val === "company") {
        entityType = "companies";
      } else if (val === "questions" || val === "question") {
        entityType = "questions";
      } else {
        console.error(`Error: Invalid entity type "${val}". Expected "companies" or "questions".`);
        process.exit(1);
      }
    } else if (!arg.startsWith("-")) {
      filePath = arg;
    } else {
      console.error(`Error: Unknown option "${arg}". Run with --help for usage.`);
      process.exit(1);
    }
  }

  if (!filePath) {
    console.error("Error: Missing input file path.");
    printUsage();
    process.exit(1);
  }

  // Check database configuration
  if (!process.env.MONGODB_URI) {
    console.error(
      "Error: MONGODB_URI environment variable is missing. Please define MONGODB_URI in .env.local or your environment."
    );
    process.exit(1);
  }

  let dbConnected = false;
  try {
    await dbConnect();
    dbConnected = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error: Failed to connect to MongoDB database.");
    console.error(msg);
    process.exit(1);
  }

  try {
    const report = await runIngestion({
      filePath: path.resolve(process.cwd(), filePath),
      type: entityType,
      dryRun,
    });

    printReport(report);

    // Close database connection cleanly
    await mongoose.disconnect();

    // Exit code 0 if 0 failures, 1 if any record failed
    if (report.failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\nIngestion failed: ${msg}`);
    if (dbConnected) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

main();
