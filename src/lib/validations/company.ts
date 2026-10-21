import { z } from "zod";

export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  logo: z
    .string()
    .trim()
    .refine(
      (val) => !val || val === "" || val.startsWith("/") || /^https?:\/\//.test(val),
      "Invalid logo URL or path"
    )
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(1000, "Description is too long").optional().or(z.literal("")),
  website: z.string().trim().url("Invalid website URL").optional().or(z.literal("")),
});

export const companyUpdateSchema = companySchema.partial();

export type CompanyInput = z.infer<typeof companySchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
