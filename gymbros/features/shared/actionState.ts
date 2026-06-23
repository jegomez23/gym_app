export type ActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialActionState: ActionState = {
  status: "idle",
  message: null,
};
