import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string({ message: "Email is required" })
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .max(255, "Email is too long")
    .email("Invalid email address format"),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters"),
});

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Invalid email address format"),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
});

export const slugParamSchema = z
  .string({ message: "Slug parameter is required" })
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .max(200, "Slug is too long")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
  );

export const objectIdParamSchema = z
  .string({ message: "ID is required" })
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long")
    .max(100, "New password cannot exceed 100 characters"),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password confirmation is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
