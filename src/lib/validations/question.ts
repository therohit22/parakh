import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const questionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(200, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .trim()
    .max(5000, "Description is too long")
    .optional()
    .or(z.literal("")),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    message: "Difficulty must be Easy, Medium, or Hard",
  }),
  topics: z
    .array(z.string().trim().max(50, "Topic name too long"))
    .max(30, "Too many topics")
    .default([]),
  pattern: z.string().trim().max(50, "Pattern name too long").optional().or(z.literal("")),
  companies: z
    .array(z.string().regex(objectIdRegex, "Invalid Company ID format"))
    .max(50, "Too many companies")
    .default([]),
  leetcodeUrl: z
    .string()
    .trim()
    .url("Invalid LeetCode URL")
    .refine((url) => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return (
          (parsed.protocol === "https:" || parsed.protocol === "http:") &&
          (parsed.hostname === "leetcode.com" || parsed.hostname === "www.leetcode.com") &&
          parsed.pathname.startsWith("/problems/")
        );
      } catch {
        return false;
      }
    }, "Must be an official LeetCode problem URL (e.g., https://leetcode.com/problems/two-sum/)")
    .optional()
    .or(z.literal("")),
});

export const questionUpdateSchema = questionSchema.partial();

export const noteSchema = z.object({
  content: z
    .string({ message: "Content is required" })
    .trim()
    .min(1, "Note cannot be empty")
    .max(2000, "Note cannot exceed 2000 characters"),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
