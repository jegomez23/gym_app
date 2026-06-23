import type { PostgrestError } from "@supabase/supabase-js";
import { ZodError } from "zod";

export type AppErrorCode =
  | "database_error"
  | "validation_error"
  | "authorization_error"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "infrastructure_error";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(message: string, code: AppErrorCode, cause?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.cause = cause;
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", cause?: unknown) {
    super(message, "database_error", cause);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input", cause?: unknown) {
    super(message, "validation_error", cause);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Not authorized", cause?: unknown) {
    super(message, "authorization_error", cause);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", cause?: unknown) {
    super(message, "not_found", cause);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", cause?: unknown) {
    super(message, "conflict", cause);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", cause?: unknown) {
    super(message, "rate_limit", cause);
    this.name = "RateLimitError";
  }
}

export class InfrastructureError extends AppError {
  constructor(message = "Infrastructure is not available", cause?: unknown) {
    super(message, "infrastructure_error", cause);
    this.name = "InfrastructureError";
  }
}

export function toValidationError(error: ZodError): ValidationError {
  return new ValidationError(
    error.issues[0]?.message ?? "Invalid input",
    error
  );
}

export function toDatabaseError(error: PostgrestError): AppError {
  if (error.code === "PGRST116") {
    return new NotFoundError("Resource not found", error);
  }

  if (error.code === "23505") {
    return new ConflictError("Resource already exists", error);
  }

  if (error.code === "42501") {
    return new AuthorizationError("Not authorized for this operation", error);
  }

  return new DatabaseError("Database operation failed", error);
}
