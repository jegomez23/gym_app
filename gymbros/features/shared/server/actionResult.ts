import "server-only";

import { unstable_rethrow } from "next/navigation";

import { AppError } from "@/lib/dal/errors";
import type { ActionState } from "../actionState";

export function actionErrorState(error: unknown): ActionState {
  // Root cause of the "Algo salió mal" publish failure: requireProfile() uses
  // redirect()/notFound(), which work by *throwing* Next control-flow signals. The
  // action's try/catch funnels everything here, so without this re-throw those
  // signals were swallowed and turned into a generic error instead of an actual
  // navigation. unstable_rethrow lets framework errors propagate untouched.
  unstable_rethrow(error);

  // An explicit human message (e.g. a validation copy or a friendlyAuthError result).
  if (typeof error === "string") {
    return { status: "error", message: error };
  }

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
