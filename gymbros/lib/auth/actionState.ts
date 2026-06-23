export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: null,
};

export function authErrorState(message: string): AuthActionState {
  return {
    status: "error",
    message,
  };
}

export function authSuccessState(message: string): AuthActionState {
  return {
    status: "success",
    message,
  };
}
