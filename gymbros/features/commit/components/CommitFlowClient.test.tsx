import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommitFlowClient } from "./CommitFlowClient";
import { publishCommitAction } from "../actions/publishCommit";

// The server action pulls in server-only modules (requireProfile → next/headers),
// so it is mocked: this test is about the client form preserving cross-step values.
vi.mock("../actions/publishCommit", () => ({
  publishCommitAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CommitFlowClient", () => {
  it("keeps the title (collected on step 0) serializable on the submit step", () => {
    const { container } = render(<CommitFlowClient name="Juan" />);

    fireEvent.change(screen.getByLabelText("¿Qué hiciste?"), {
      target: { value: "Tren inferior" },
    });

    // Advance step 0 → 1 → 2 (the title input unmounts after step 0).
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    // The submit step is reached and the title is still in the form via its hidden
    // input — the exact value that used to be lost when the step unmounted.
    expect(
      screen.getByRole("button", { name: "Dejar evidencia" })
    ).toBeInTheDocument();
    const hiddenTitle = container.querySelector<HTMLInputElement>(
      'input[name="title"]'
    );
    expect(hiddenTitle?.value).toBe("Tren inferior");
  });

  it("preserves the note and reflection when navigating back from the submit step", () => {
    render(<CommitFlowClient name="Juan" />);

    fireEvent.change(screen.getByLabelText("¿Qué hiciste?"), {
      target: { value: "Tren inferior" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" })); // → step 1
    fireEvent.click(screen.getByRole("button", { name: "Continuar" })); // → step 2

    fireEvent.change(screen.getByLabelText("Nota personal"), {
      target: { value: "Hoy aparecí porque importa." },
    });
    fireEvent.change(screen.getByLabelText("Nota para tu yo del futuro"), {
      target: { value: "Recuerda este día." },
    });

    // "Volver" unmounts the submit step; returning to it used to wipe both fields.
    fireEvent.click(screen.getByRole("button", { name: "Volver" })); // → step 1
    fireEvent.click(screen.getByRole("button", { name: "Continuar" })); // → step 2

    expect(screen.getByLabelText("Nota personal")).toHaveValue(
      "Hoy aparecí porque importa."
    );
    expect(screen.getByLabelText("Nota para tu yo del futuro")).toHaveValue(
      "Recuerda este día."
    );
  });

  it("advances on Enter from a single-line step instead of publishing", () => {
    render(<CommitFlowClient name="Juan" />);

    const titleInput = screen.getByLabelText("¿Qué hiciste?");
    fireEvent.change(titleInput, { target: { value: "Tren inferior" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });

    // Enter moved to the feeling step; it did not seal the commit prematurely.
    expect(
      screen.getByRole("button", { name: "Constante" })
    ).toBeInTheDocument();
    expect(publishCommitAction).not.toHaveBeenCalled();
  });
});
