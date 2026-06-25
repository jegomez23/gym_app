import { describe, expect, it } from "vitest";

import { NotFoundError } from "./errors";
import { unwrapSingle } from "./result";

describe("unwrapSingle", () => {
  it("returns the first row of a set-returning result", () => {
    expect(unwrapSingle({ data: [{ id: 1 }, { id: 2 }], error: null })).toEqual(
      {
        id: 1,
      }
    );
  });

  it("throws NotFoundError on an empty set instead of yielding undefined", () => {
    // Regression: the old `unwrapData(result)[0]` returned undefined here, which a
    // mapper then dereferenced into a raw TypeError → the route crashed to error.tsx.
    expect(() => unwrapSingle({ data: [], error: null })).toThrow(
      NotFoundError
    );
  });
});
