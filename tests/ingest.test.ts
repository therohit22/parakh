import { describe, it, expect } from "vitest";
import { parseCsv } from "../scripts/ingest/csvParser";

describe("Data Ingestion & CSV Parser Safety (Day 11/12)", () => {
  it("should parse standard CSV headers and fields", () => {
    const csv = `name,slug,website\nGoogle,google,https://about.google\nAmazon,amazon,https://amazon.com`;
    const result = parseCsv(csv);
    expect(result.headers).toEqual(["name", "slug", "website"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].data.name).toBe("Google");
    expect(result.rows[0].rowNumber).toBe(2);
    expect(result.rows[1].data.name).toBe("Amazon");
    expect(result.rows[1].rowNumber).toBe(3);
  });

  it("should parse quoted fields containing commas without breaking column alignment", () => {
    const csv = `name,slug,description\nGoogle,google,"Google LLC is a technology company, specializing in search, cloud, and ads."`;
    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.slug).toBe("google");
    expect(result.rows[0].data.description).toBe(
      "Google LLC is a technology company, specializing in search, cloud, and ads."
    );
  });

  it("should handle escaped double quotes correctly per RFC 4180", () => {
    const csv = `title,slug,description\nQuotes Test,quotes-test,"He said, ""Hello World"" to the team."`;
    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.description).toBe('He said, "Hello World" to the team.');
  });

  it("should ignore empty rows and trailing line breaks", () => {
    const csv = `name,slug\n\nGoogle,google\n\n\nAmazon,amazon\n\n`;
    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].data.slug).toBe("google");
    expect(result.rows[1].data.slug).toBe("amazon");
  });

  it("should handle multi-value list fields using pipe delimiter", () => {
    const csv = `title,topics,companies\nTwo Sum,Array|Hash Table,google|amazon`;
    const result = parseCsv(csv);
    const row = result.rows[0];
    const topics = row.data.topics.split("|").map((t) => t.trim());
    const companies = row.data.companies.split("|").map((c) => c.trim());

    expect(topics).toEqual(["Array", "Hash Table"]);
    expect(companies).toEqual(["google", "amazon"]);
  });
});
