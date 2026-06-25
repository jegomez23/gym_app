import type { PostgrestError } from "@supabase/supabase-js";

import { NotFoundError, toDatabaseError } from "./errors";

type PostgrestResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export function unwrapData<T>(result: PostgrestResult<T>): NonNullable<T> {
  if (result.error) {
    throw toDatabaseError(result.error);
  }

  if (result.data === null) {
    throw new NotFoundError();
  }

  return result.data as NonNullable<T>;
}

export function unwrapList<T>(result: PostgrestResult<T[]>): T[] {
  if (result.error) {
    throw toDatabaseError(result.error);
  }

  return result.data ?? [];
}

/**
 * For set-returning RPCs read as a single row. An empty result is a missing
 * resource (NotFoundError), never an undefined that a mapper would crash on.
 */
export function unwrapSingle<T>(result: PostgrestResult<T[]>): T {
  const row = unwrapList(result)[0];

  if (row === undefined) {
    throw new NotFoundError();
  }

  return row;
}
