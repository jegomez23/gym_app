import type { DomainDataClient } from "../client";
import { toValidationError } from "../errors";
import {
  mapCirclePresence,
  mapCommitDetail,
  mapJourneyItem,
  mapProgressSummary,
  mapSharedHistory,
} from "../mappers";
import { unwrapList, unwrapSingle } from "../result";
import { dateRangeSchema, paginationSchema, uuidSchema } from "../schemas";
import type {
  CirclePresence,
  CommitDetail,
  DateRange,
  JourneyItem,
  PaginationOptions,
  ProgressSummary,
  SharedHistory,
} from "../types";

export class DomainRpc {
  constructor(private readonly client: DomainDataClient) {}

  async getCirclePresence(
    profileId: string,
    since?: string
  ): Promise<CirclePresence[]> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const result = await this.client.rpc("get_circle_presence", {
      p_profile_id: parsedProfileId.data,
      ...(since && { p_since: since }),
    });

    return unwrapList(result).map(mapCirclePresence);
  }

  async getJourney(
    profileId: string,
    options: PaginationOptions = {}
  ): Promise<JourneyItem[]> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedOptions = paginationSchema.safeParse(options);
    if (!parsedOptions.success) {
      throw toValidationError(parsedOptions.error);
    }

    const result = await this.client.rpc("get_journey_timeline", {
      p_profile_id: parsedProfileId.data,
      p_limit: parsedOptions.data.limit,
      p_before: parsedOptions.data.before,
    });

    return unwrapList(result).map(mapJourneyItem);
  }

  async getSharedHistory(
    otherProfileId: string,
    limit?: number
  ): Promise<SharedHistory | null> {
    const parsedOtherProfileId = uuidSchema.safeParse(otherProfileId);
    if (!parsedOtherProfileId.success) {
      throw toValidationError(parsedOtherProfileId.error);
    }

    const result = await this.client.rpc("get_shared_history", {
      p_other_profile_id: parsedOtherProfileId.data,
      p_limit: limit,
    });

    const rows = unwrapList(result).map(mapSharedHistory);
    return rows[0] ?? null;
  }

  async getProgressSummary(
    profileId: string,
    range: DateRange = {}
  ): Promise<ProgressSummary> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedRange = dateRangeSchema.safeParse(range);
    if (!parsedRange.success) {
      throw toValidationError(parsedRange.error);
    }

    const result = await this.client.rpc("get_progress_summary", {
      p_profile_id: parsedProfileId.data,
      p_from: parsedRange.data.from,
      p_to: parsedRange.data.to,
    });

    return mapProgressSummary(unwrapSingle(result));
  }

  async getCommitDetail(commitId: string): Promise<CommitDetail> {
    const parsedCommitId = uuidSchema.safeParse(commitId);
    if (!parsedCommitId.success) {
      throw toValidationError(parsedCommitId.error);
    }

    const result = await this.client.rpc("get_commit_detail", {
      p_commit_id: parsedCommitId.data,
    });

    return mapCommitDetail(unwrapSingle(result));
  }
}
