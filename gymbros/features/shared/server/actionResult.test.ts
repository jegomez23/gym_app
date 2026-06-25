import { redirect } from "next/navigation";
import { describe, expect, it } from "vitest";

import { DatabaseError } from "@/lib/dal/errors";

import { actionErrorState, actionSuccessState } from "./actionResult";

describe("actionErrorState", () => {
  it("re-throws Next redirect control-flow errors instead of swallowing them", () => {
    // redirect() signals navigation by throwing; capture that real error.
    let redirectError: unknown;
    try {
      redirect("/login");
    } catch (error) {
      redirectError = error;
    }

    expect(redirectError).toBeDefined();
    // The regression: this used to return a generic error state, breaking the
    // redirect (and surfacing "Algo salió mal" on publish). It must propagate.
    expect(() => actionErrorState(redirectError)).toThrow();
  });

  it("maps a domain error to a human error state", () => {
    const state = actionErrorState(new DatabaseError("boom"));
    expect(state.status).toBe("error");
    expect(state.message).toBe("boom");
  });

  it("falls back to a generic message for unknown errors", () => {
    const state = actionErrorState(new Error("raw"));
    expect(state).toEqual({
      status: "error",
      message: "No se pudo completar la accion.",
    });
  });

  it("passes through an explicit string message", () => {
    expect(actionErrorState("Mensaje claro").message).toBe("Mensaje claro");
  });

  it("builds a success state", () => {
    expect(actionSuccessState("ok")).toEqual({
      status: "success",
      message: "ok",
    });
  });
});
