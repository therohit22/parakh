import { z } from "zod";

/**
 * Escapes characters that have special meaning in regular expressions.
 * Ensures user search input can safely be used in a RegExp without injection or syntax errors.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export const questionQuerySchema = z.object({
  search: z.string().trim().max(100, "Search query is too long").optional(),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"], {
      message: "Difficulty must be Easy, Medium, or Hard",
    })
    .optional(),
  topic: z.string().trim().max(50, "Topic filter is too long").optional(),
  pattern: z.string().trim().max(50, "Pattern filter is too long").optional(),
  company: z.string().trim().max(100, "Company filter is too long").optional(),
  page: z
    .coerce
    .number({ message: "Page must be a number" })
    .int("Page must be an integer")
    .min(1, "Page must be greater than or equal to 1")
    .default(1),
  limit: z
    .coerce
    .number({ message: "Limit must be a number" })
    .int("Limit must be an integer")
    .min(1, "Limit must be greater than or equal to 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
  sort: z
    .enum(["latest", "oldest", "title"], {
      message: "Sort must be latest, oldest, or title",
    })
    .default("latest"),
});

export const companyQuerySchema = z.object({
  search: z.string().trim().max(100, "Search query is too long").optional(),
  page: z
    .coerce
    .number({ message: "Page must be a number" })
    .int("Page must be an integer")
    .min(1, "Page must be greater than or equal to 1")
    .default(1),
  limit: z
    .coerce
    .number({ message: "Limit must be a number" })
    .int("Limit must be an integer")
    .min(1, "Limit must be greater than or equal to 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
  sort: z
    .enum(["name", "latest", "oldest"], {
      message: "Sort must be name, latest, or oldest",
    })
    .default("name"),
});

export type QuestionQueryInput = z.infer<typeof questionQuerySchema>;
export type CompanyQueryInput = z.infer<typeof companyQuerySchema>;
