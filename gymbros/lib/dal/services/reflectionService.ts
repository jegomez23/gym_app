import type { Reflection } from "../types";

type ReflectionDataAccess = {
  listOldestReflectionsForProfile(
    profileId: string,
    limit?: number
  ): Promise<Reflection[]>;
};

/**
 * Reads over a profile's own reflections that are not commit-scoped. Today this
 * serves the Memory Selection Engine's Profile origin (the user's oldest words);
 * commit-scoped reflection reads/writes still live on CommitService.
 */
export class ReflectionService {
  constructor(private readonly reflections: ReflectionDataAccess) {}

  listOldestForProfile(
    profileId: string,
    limit?: number
  ): Promise<Reflection[]> {
    return this.reflections.listOldestReflectionsForProfile(profileId, limit);
  }
}
