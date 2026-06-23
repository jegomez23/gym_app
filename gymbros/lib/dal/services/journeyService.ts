import type {
  DateRange,
  JourneyItem,
  PaginationOptions,
  ProgressSummary,
} from "../types";

type JourneyRpcAccess = {
  getJourney(
    profileId: string,
    options?: PaginationOptions
  ): Promise<JourneyItem[]>;
  getProgressSummary(
    profileId: string,
    range?: DateRange
  ): Promise<ProgressSummary>;
};

export class JourneyService {
  constructor(private readonly rpc: JourneyRpcAccess) {}

  getJourney(
    profileId: string,
    options?: PaginationOptions
  ): Promise<JourneyItem[]> {
    return this.rpc.getJourney(profileId, options);
  }

  getProgressSummary(
    profileId: string,
    range?: DateRange
  ): Promise<ProgressSummary> {
    return this.rpc.getProgressSummary(profileId, range);
  }
}
