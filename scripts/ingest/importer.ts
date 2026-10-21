import fs from "fs";
import path from "path";
import { parseCsv } from "./csvParser.ts";
import type { IngestionOptions, IngestionReport } from "./types.ts";
import { Company } from "../../src/models/Company.ts";
import { Question } from "../../src/models/Question.ts";
import { companySchema } from "../../src/lib/validations/company.ts";
import { questionSchema } from "../../src/lib/validations/question.ts";

interface RawRecord {
  identifier: string;
  data: Record<string, unknown>;
}

export async function runIngestion(options: IngestionOptions): Promise<IngestionReport> {
  const { filePath, dryRun = false } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileExt = path.extname(filePath).toLowerCase();
  if (fileExt !== ".csv" && fileExt !== ".json") {
    throw new Error(
      `Unsupported file extension "${fileExt}". Only .csv and .json files are supported.`
    );
  }

  const rawContent = fs.readFileSync(filePath, "utf-8").trim();
  if (!rawContent) {
    throw new Error(`Input file is empty: ${filePath}`);
  }

  let rawRecords: RawRecord[] = [];

  if (fileExt === ".json") {
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawContent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Malformed JSON in file "${filePath}": ${msg}`);
    }

    if (!Array.isArray(parsedJson)) {
      throw new Error(
        `JSON input must be an array of records. Found: ${typeof parsedJson}`
      );
    }

    rawRecords = parsedJson.map((item, idx) => ({
      identifier: `Index ${idx}`,
      data: item && typeof item === "object" ? (item as Record<string, unknown>) : {},
    }));
  } else {
    // CSV
    const csvResult = parseCsv(rawContent);
    if (csvResult.rows.length === 0) {
      throw new Error(`CSV file contains no data rows: ${filePath}`);
    }
    rawRecords = csvResult.rows.map((row) => ({
      identifier: `Row ${row.rowNumber}`,
      data: row.data,
    }));
  }

  // Determine entity type
  let entityType = options.type;
  if (!entityType) {
    // Attempt auto-detection from keys
    const firstRowKeys = rawRecords.length > 0 ? Object.keys(rawRecords[0].data).map((k) => k.toLowerCase()) : [];
    if (firstRowKeys.includes("difficulty") || firstRowKeys.includes("leetcodeurl") || firstRowKeys.includes("title")) {
      entityType = "questions";
    } else if (firstRowKeys.includes("name") && !firstRowKeys.includes("difficulty")) {
      entityType = "companies";
    } else {
      throw new Error(
        `Unable to determine entity type for "${filePath}". Please explicitly specify --type=companies or --type=questions`
      );
    }
  }

  const report: IngestionReport = {
    entityType,
    filePath,
    dryRun,
    totalProcessed: rawRecords.length,
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    failures: [],
  };

  const seenSlugs = new Set<string>();

  if (entityType === "companies") {
    for (const record of rawRecords) {
      const { identifier, data } = record;
      const rawName = typeof data.name === "string" ? data.name.trim() : "";
      const rawSlug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
      const rawLogo = typeof data.logo === "string" ? data.logo.trim() : "";
      const rawDescription = typeof data.description === "string" ? data.description.trim() : "";
      const rawWebsite = typeof data.website === "string" ? data.website.trim() : "";

      if (!rawSlug) {
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug || undefined,
          reason: "Slug is required and cannot be empty",
        });
        continue;
      }

      // Check for duplicates within input file
      if (seenSlugs.has(rawSlug)) {
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug,
          reason: `Duplicate slug "${rawSlug}" found within input file`,
        });
        continue;
      }
      seenSlugs.add(rawSlug);

      // Validate with companySchema
      const parseResult = companySchema.safeParse({
        name: rawName,
        slug: rawSlug,
        logo: rawLogo || "",
        description: rawDescription || "",
        website: rawWebsite || "",
      });

      if (!parseResult.success) {
        const issues = parseResult.error.issues || [];
        const errorMessages = issues.map((e) => e.message).join("; ");
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug,
          reason: errorMessages,
        });
        continue;
      }

      const validCompanyData = parseResult.data;

      try {
        const existing = await Company.findOne({ slug: validCompanyData.slug });
        if (existing) {
          if (!dryRun) {
            existing.name = validCompanyData.name;
            existing.logo = validCompanyData.logo || "";
            existing.description = validCompanyData.description || "";
            existing.website = validCompanyData.website || "";
            await existing.save();
          }
          report.updatedCount++;
        } else {
          if (!dryRun) {
            await Company.create(validCompanyData);
          }
          report.createdCount++;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug,
          reason: `Database error: ${msg}`,
        });
      }
    }
  } else if (entityType === "questions") {
    // Pre-load company lookup map to resolve human-readable company slugs to ObjectIds in a single query.
    // Guarantees referential integrity without orphan ObjectId creation or repeated DB lookups.
    const allCompanies = await Company.find({}, { slug: 1, _id: 1 }).lean();
    const companySlugToIdMap = new Map<string, string>();
    for (const c of allCompanies) {
      companySlugToIdMap.set(c.slug.toLowerCase(), c._id.toString());
    }

    for (const record of rawRecords) {
      const { identifier, data } = record;
      const rawTitle = typeof data.title === "string" ? data.title.trim() : "";
      const rawSlug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
      const rawDescription = typeof data.description === "string" ? data.description.trim() : "";
      const rawDifficulty = typeof data.difficulty === "string" ? data.difficulty.trim() : "";
      const rawLeetcodeUrl =
        typeof data.leetcodeUrl === "string"
          ? data.leetcodeUrl.trim()
          : typeof data.leetcodeurl === "string"
            ? data.leetcodeurl.trim()
            : "";

      // Parse topics
      let topicsList: string[] = [];
      if (Array.isArray(data.topics)) {
        topicsList = data.topics.map((t: unknown) => String(t).trim()).filter(Boolean);
      } else if (typeof data.topics === "string" && data.topics.trim()) {
        const delimiter = data.topics.includes("|") ? "|" : ",";
        topicsList = data.topics
          .split(delimiter)
          .map((t) => t.trim())
          .filter(Boolean);
      }

      // Parse companies
      let companySlugs: string[] = [];
      if (Array.isArray(data.companies)) {
        companySlugs = data.companies.map((c: unknown) => String(c).trim().toLowerCase()).filter(Boolean);
      } else if (typeof data.companies === "string" && data.companies.trim()) {
        const delimiter = data.companies.includes("|") ? "|" : ",";
        companySlugs = data.companies
          .split(delimiter)
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean);
      }

      if (!rawSlug) {
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug || undefined,
          reason: "Slug is required and cannot be empty",
        });
        continue;
      }

      // Check for duplicates within input file
      if (seenSlugs.has(rawSlug)) {
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug,
          reason: `Duplicate slug "${rawSlug}" found within input file`,
        });
        continue;
      }
      seenSlugs.add(rawSlug);

      // Resolve company slugs to ObjectIds
      const resolvedCompanyIds: string[] = [];
      let unknownCompany: string | null = null;

      for (const compSlug of companySlugs) {
        const foundId = companySlugToIdMap.get(compSlug);
        if (!foundId) {
          unknownCompany = compSlug;
          break;
        }
        if (!resolvedCompanyIds.includes(foundId)) {
          resolvedCompanyIds.push(foundId);
        }
      }

      if (unknownCompany) {
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug,
          reason: `Unknown company slug: "${unknownCompany}"`,
        });
        continue;
      }

      // Validate with questionSchema
      const parseResult = questionSchema.safeParse({
        title: rawTitle,
        slug: rawSlug,
        description: rawDescription || "",
        difficulty: rawDifficulty,
        topics: topicsList,
        companies: resolvedCompanyIds,
        leetcodeUrl: rawLeetcodeUrl || "",
      });

      if (!parseResult.success) {
        const issues = parseResult.error.issues || [];
        const errorMessages = issues.map((e) => e.message).join("; ");
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug,
          reason: errorMessages,
        });
        continue;
      }

      const validQuestionData = parseResult.data;

      try {
        let existing = null;
        if (validQuestionData.leetcodeUrl) {
          existing = await Question.findOne({ leetcodeUrl: validQuestionData.leetcodeUrl });
        }
        if (!existing) {
          existing = await Question.findOne({ slug: validQuestionData.slug });
        }

        if (existing) {
          if (!dryRun) {
            existing.title = validQuestionData.title || existing.title;
            if (validQuestionData.description && !existing.description) {
              existing.description = validQuestionData.description;
            }
            existing.difficulty = validQuestionData.difficulty || existing.difficulty;

            // Merge topics without duplicates
            const mergedTopics = Array.from(
              new Set([
                ...(existing.topics || []),
                ...(validQuestionData.topics || []),
              ])
            );
            existing.topics = mergedTopics;

            // Merge company references without duplicates (guarantees 1 question has multiple companies)
            const existingCompanyIds = (existing.companies || []).map((c: { toString: () => string }) =>
              c.toString()
            );
            const newCompanyIds = (validQuestionData.companies || []).map((c: { toString: () => string }) =>
              c.toString()
            );
            const mergedCompanyIds = Array.from(
              new Set([...existingCompanyIds, ...newCompanyIds])
            );
            existing.companies = mergedCompanyIds as unknown as typeof existing.companies;

            // Preserve verified leetcodeUrl if already present, or update if existing is missing
            if (!existing.leetcodeUrl && validQuestionData.leetcodeUrl) {
              existing.leetcodeUrl = validQuestionData.leetcodeUrl;
            }

            await existing.save();
          }
          report.updatedCount++;
        } else {
          if (!dryRun) {
            await Question.create(validQuestionData);
          }
          report.createdCount++;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.failedCount++;
        report.failures.push({
          identifier,
          slug: rawSlug,
          reason: `Database error: ${msg}`,
        });
      }
    }
  }

  return report;
}

export function printReport(report: IngestionReport): void {
  console.log("\n========================================");
  console.log("             IMPORT REPORT              ");
  console.log("========================================");
  console.log(`Entity:     ${report.entityType.toUpperCase()}`);
  console.log(`Input:      ${report.filePath}`);
  console.log(`Mode:       ${report.dryRun ? "DRY RUN (No DB changes)" : "LIVE IMPORT"}`);
  console.log("----------------------------------------");
  console.log(`Processed:  ${report.totalProcessed}`);
  console.log(`Created:    ${report.createdCount}`);
  console.log(`Updated:    ${report.updatedCount}`);
  console.log(`Skipped:    ${report.skippedCount}`);
  console.log(`Failed:     ${report.failedCount}`);
  console.log("----------------------------------------");

  if (report.failures.length > 0) {
    console.log(`Failures (${report.failures.length}):`);
    for (const fail of report.failures) {
      const slugInfo = fail.slug ? ` (slug: ${fail.slug})` : "";
      console.log(`- ${fail.identifier}${slugInfo}: ${fail.reason}`);
    }
    console.log("========================================\n");
  } else {
    console.log("All records processed successfully with 0 failures.");
    console.log("========================================\n");
  }
}
