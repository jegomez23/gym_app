import "server-only";

import { AppError } from "@/lib/dal/errors";
import type { ActionState } from "../actionState";

export function actionErrorState(error: unknown): ActionState {
  if (error instanceof AppError) {
    return {
      status: "error",
      message: error.message,
    };
  }

  return {
    status: "error",
    message: "No se pudo completar la accion.",
  };
}

export function actionSuccessState(message: string): ActionState {
  return {
    status: "success",
    message,
  };
}
