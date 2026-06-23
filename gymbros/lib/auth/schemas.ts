import { z } from "zod";

import { profileVisibilitySchema, usernameSchema } from "@/lib/dal";

export const authEmailSchema = z.string().trim().toLowerCase().email();
export const authPasswordSchema = z.string().min(8).max(128);

export const credentialsSchema = z.object({
  email: authEmailSchema,
  password: authPasswordSchema,
  returnTo: z.string().optional().nullable(),
});

export const signUpSchema = credentialsSchema
  .extend({
    name: z.string().trim().min(1).max(100),
  })
  .refine((value) => value.password.length >= 8, {
    message: "La contrasena debe tener al menos 8 caracteres.",
    path: ["password"],
  });

export const forgotPasswordSchema = z.object({
  email: authEmailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: authPasswordSchema,
    confirmPassword: authPasswordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export const reservedUsernames = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "circle",
  "commit",
  "gymcircle",
  "login",
  "logout",
  "me",
  "onboarding",
  "profile",
  "signup",
  "support",
]);

export const onboardingProfileSchema = z.object({
  username: usernameSchema.refine(
    (value) => !reservedUsernames.has(value),
    "Ese username esta reservado."
  ),
  name: z.string().trim().min(1).max(100),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((value) => value || null),
  bio: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform((value) => value || null),
  visibilityPreference: profileVisibilitySchema.default("circle"),
  timezone: z.string().trim().min(1).max(80).default("UTC"),
  locale: z.string().trim().min(2).max(20).default("en"),
});

export const updateProfileFormSchema = onboardingProfileSchema
  .partial()
  .extend({
    onboardingCompleted: z.boolean().optional(),
  });
