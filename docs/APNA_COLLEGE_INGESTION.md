# Apna College DSA Sheet Metadata Ingestion Audit

## Overview
As part of expanding Parakh's company-wise coding preparation catalog, the **Apna College DSA Sheet** was utilized strictly as an external discovery and reference source. 

In adherence to clean data ethics and copyright best practices:
- **Zero Proprietary Content Copied**: No problem statements, explanations, editorial solutions, source code, hints, test cases, or course text were copied.
- **Metadata Only**: Only technical metadata was extracted: Problem Title, Primary DSA Topics, Difficulty Tier, and Reported Company Tags.
- **Independent LeetCode Verification**: Every single problem was mapped to its official LeetCode counterpart and independently verified via automated LeetCode GraphQL queries (`https://leetcode.com/graphql`) prior to database ingestion.

---

## Verification & Mapping Summary

| Metric | Value |
| :--- | :--- |
| **Total Discovered Problems Evaluated** | 84 |
| **LeetCode Slugs Verified via GraphQL API** | 84 / 84 (100.0%) |
| **Failed / Mismatched Slugs** | 0 |
| **Questions Newly Inserted** | 29 |
| **Existing Questions Merged with New Company Tags** | 55 |
| **Skipped / Failed Records** | 0 |

---

## Deduplication & Many-to-Many Company Association

Parakh features a normalized many-to-many relationship between `Question` and `Company` models using MongoDB `ObjectId` references in the `companies: [{ type: Schema.Types.ObjectId, ref: "Company" }]` array.

When ingesting questions that already exist in Parakh's database:
1. `scripts/ingest/importer.ts` identifies existing questions via their unique, SEO-friendly `slug`.
2. Existing company associations are preserved.
3. Newly discovered company tags are merged using set-union deduplication:
   ```ts
   const existingCompanyIds = (existing.companies || []).map(id => id.toString());
   const mergedCompanyIds = Array.from(new Set([...existingCompanyIds, ...companyIds.map(id => id.toString())]));
   ```
4. This ensures cross-company interview classics (such as *Two Sum*, *Search in Rotated Sorted Array*, *Merge Intervals*, *Lowest Common Ancestor*, *Trapping Rain Water*, and *LRU Cache*) maintain a single source of truth while correctly indexing under all relevant target companies.

---

## Database State After Ingestion

### Overall Counts
- **Total Companies**: 8
- **Total Questions in Database**: 117
- **Questions with Verified LeetCode Practice Link**: 115 / 117 (98.3%) *(Note: The only 2 questions without external links are Day 11 internal pipeline test fixtures)*

### Company Preparation Breakdown
| Company | Category | Verified Practice Questions | Key Topic Areas |
| :--- | :--- | :---: | :--- |
| **Amazon** | Tier-1 Global Tech | **83** | Arrays, Trees, Dynamic Programming, Graphs, Heaps, Two Pointers |
| **Microsoft** | Tier-1 Global Tech | **64** | Binary Search, Trees & BSTs, Strings, Linked Lists, Matrix, DP |
| **Google** | Tier-1 Global Tech | **48** | Advanced Graphs, Recursion, Trees, Sliding Window, DP, Matrix |
| **Flipkart** | Top Indian E-Commerce | **31** | Monotonic Stacks, Sliding Window, Two Pointers, Trees, Backtracking |
| **Deloitte** | Tech Consulting Leader | **22** | Arrays, Strings, Two Pointers, Linked Lists, Stack, Trees, DP |
| **Infosys** | Tech Consulting Leader | **22** | Arrays, Math, Two Pointers, Strings, DP, Trees, Bit Manipulation |
| **Zomato** | Tech Consumer Leader | **21** | Arrays, Hashing, Intervals, Matrix, Backtracking, Graphs |
| **Netflix** | Tier-1 Global Tech | **1** | System Design & Performance Focused |

---

## Verification Steps Performed

1. **Pre-flight Slug Verification (`scripts/verify_leetcode_slugs.js`)**:
   Querying LeetCode GraphQL API with `titleSlug` confirmed all 84 problems returned valid IDs, official titles, and matching difficulty classifications.
2. **Dry Run Simulation (`npm run ingest -- fixtures/questions_apna_college.json --type=questions --dry-run`)**:
   Simulated document parsing, schema validation, and company ID resolution with 0 errors.
3. **Live Import Execution (`npm run ingest -- fixtures/questions_apna_college.json --type=questions`)**:
   Successfully wrote 29 new records and updated 55 existing records in MongoDB.
4. **Automated Vitest Suite (`npm run test`)**:
   All 47 tests passed (validation, security, authentication, ingestion).
5. **Production Build (`npm run build`)**:
   Clean compile with Next.js Turbopack, 27 static and server-streamed routes optimized.
