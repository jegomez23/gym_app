import { z } from "zod";

const jsonValueSchema: z.ZodType<
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLength)
    .optional()
    .nullable()
    .transform((value) => value ?? null);

export const uuidSchema = z.string().uuid();

export const profileVisibilitySchema = z.enum(["private", "circle", "public"]);
export const commitVisibilitySchema = z.enum(["private", "circle", "public"]);
export const reflectionVisibilitySchema = z.enum(["private", "circle"]);
export const commitIntensitySchema = z.enum(["light", "steady", "deep"]);
export const reflectionTypeSchema = z.enum([
  "technical",
  "emotional",
  "identity",
  "process",
]);
export const circleMembershipStatusSchema = z.enum([
  "pending",
  "active",
  "paused",
  "ended",
]);
export const notificationTypeSchema = z.enum([
  "support_received",
  "circle_invitation",
  "invitation_accepted",
  "reflection_received",
]);
export const notificationEntityTypeSchema = z.enum([
  "support",
  "circle_membership",
  "reflection",
  "commit",
]);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_]+$/);

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  before: z.string().datetime().nullable().optional(),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const publishCommitSchema = z.object({
  title: optionalTrimmedString(150),
  type: optionalTrimmedString(50),
  recordedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().nullable().optional(),
  intensity: commitIntensitySchema.nullable().optional(),
  note: optionalTrimmedString(500),
  visibility: commitVisibilitySchema.default("private"),
  evidence: z.array(jsonValueSchema).max(20).default([]),
});

export const changeCommitVisibilitySchema = z.object({
  commitId: uuidSchema,
  visibility: commitVisibilitySchema,
});

export const createReflectionSchema = z.object({
  commitId: uuidSchema,
  content: z.string().trim().min(1).max(300),
  type: reflectionTypeSchema.nullable().optional(),
  visibility: reflectionVisibilitySchema.default("private"),
});

export const editReflectionSchema = z.object({
  reflectionId: uuidSchema,
  content: z.string().trim().min(1).max(300).optional(),
  type: reflectionTypeSchema.nullable().optional(),
  visibility: reflectionVisibilitySchema.optional(),
});

export const updateProfileSchema = z.object({
  username: usernameSchema.optional().nullable(),
  name: z.string().trim().min(1).max(100).optional(),
  avatarUrl: optionalTrimmedString(500),
  bio: optionalTrimmedString(200),
  identityStatement: optionalTrimmedString(140),
  visibilityPreference: profileVisibilitySchema.optional(),
  onboardingCompleted: z.boolean().optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  locale: z.string().trim().min(2).max(20).optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export const createProfileSchema = z.object({
  id: uuidSchema,
  username: usernameSchema,
  name: z.string().trim().min(1).max(100),
  avatarUrl: optionalTrimmedString(500),
  bio: optionalTrimmedString(200),
  identityStatement: optionalTrimmedString(140),
  visibilityPreference: profileVisibilitySchema.default("circle"),
  onboardingCompleted: z.boolean().default(false),
  timezone: z.string().trim().min(1).max(80).default("UTC"),
  locale: z.string().trim().min(2).max(20).default("en"),
});

export const joinCircleSchema = z.object({
  circleUserId: uuidSchema,
});

export const changeCircleStatusSchema = z.object({
  circleUserId: uuidSchema,
  status: circleMembershipStatusSchema,
});

export const sendSupportSchema = z.object({
  toUserId: uuidSchema,
  message: z.string().trim().min(1).max(200),
});

export const inviteCircleMemberSchema = z.object({
  username: usernameSchema,
});

export const createNotificationSchema = z.object({
  recipientUserId: uuidSchema,
  actorUserId: uuidSchema.nullable().optional(),
  type: notificationTypeSchema,
  entityType: notificationEntityTypeSchema.nullable().optional(),
  entityId: uuidSchema.nullable().optional(),
  message: z.string().trim().min(1).max(240),
});

export type PublishCommitInput = z.input<typeof publishCommitSchema>;
export type ChangeCommitVisibilityInput = z.input<
  typeof changeCommitVisibilitySchema
>;
export type CreateReflectionInput = z.input<typeof createReflectionSchema>;
export type EditReflectionInput = z.input<typeof editReflectionSchema>;
export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
export type CreateProfileInput = z.input<typeof createProfileSchema>;
export type JoinCircleInput = z.input<typeof joinCircleSchema>;
export type ChangeCircleStatusInput = z.input<typeof changeCircleStatusSchema>;
export type SendSupportInput = z.input<typeof sendSupportSchema>;
export type InviteCircleMemberInput = z.input<typeof inviteCircleMemberSchema>;
export type CreateNotificationInput = z.input<typeof createNotificationSchema>;
