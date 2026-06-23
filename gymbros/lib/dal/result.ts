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
