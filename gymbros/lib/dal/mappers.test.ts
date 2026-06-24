import { describe, expect, it } from "vitest";

import {
  mapCircleMembership,
  mapCommit,
  mapProfile,
  mapReflection,
  mapSupport,
  toEvidence,
} from "./mappers";

describe("DAL mappers", () => {
  it("maps database rows into domain language", () => {
    expect(
      mapProfile({
        id: "00000000-0000-0000-0000-000000000001",
        username: "dia",
        name: "Dia",
        avatar_url: null,
        bio: "Building quietly",
        identity_statement: "Alguien que aparece.",
        visibility_preference: "circle",
        onboarding_completed: true,
        timezone: "Europe/Madrid",
        locale: "es",
        created_at: "2026-06-22T00:00:00.000Z",
        updated_at: "2026-06-22T00:00:00.000Z",
        deleted_at: null,
      })
    ).toMatchObject({
      avatarUrl: null,
      onboardingCompleted: true,
      visibilityPreference: "circle",
    });

    expect(
      mapCommit({
        id: "10000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000001",
        title: "Lower body restart",
        type: "training",
        recorded_at: "2026-06-22T08:00:00.000Z",
        duration_minutes: 45,
        intensity: "steady",
        note: null,
        visibility: "circle",
        evidence: ["45 minutes"],
        created_at: "2026-06-22T08:01:00.000Z",
        deleted_at: null,
      })
    ).toMatchObject({
      durationMinutes: 45,
      recordedAt: "2026-06-22T08:00:00.000Z",
      userId: "00000000-0000-0000-0000-000000000001",
    });

    expect(
      mapReflection({
        id: "20000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000001",
        commit_id: "10000000-0000-0000-0000-000000000001",
        content: "Small promises count.",
        type: "process",
        visibility: "private",
        created_at: "2026-06-22T08:02:00.000Z",
        updated_at: "2026-06-22T08:02:00.000Z",
        deleted_at: null,
      })
    ).toMatchObject({
      commitId: "10000000-0000-0000-0000-000000000001",
      userId: "00000000-0000-0000-0000-000000000001",
    });

    expect(
      mapCircleMembership({
        id: "40000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000001",
        circle_user_id: "00000000-0000-0000-0000-000000000002",
        status: "active",
        invited_by: null,
        joined_at: "2026-06-22T08:03:00.000Z",
        ended_at: null,
        created_at: "2026-06-22T08:03:00.000Z",
        deleted_at: null,
      })
    ).toMatchObject({
      circleUserId: "00000000-0000-0000-0000-000000000002",
      joinedAt: "2026-06-22T08:03:00.000Z",
    });

    expect(
      mapSupport({
        id: "30000000-0000-0000-0000-000000000001",
        from_user_id: "00000000-0000-0000-0000-000000000002",
        to_user_id: "00000000-0000-0000-0000-000000000001",
        message: "That restart looked calm.",
        created_at: "2026-06-22T08:04:00.000Z",
        deleted_at: null,
      })
    ).toMatchObject({
      fromUserId: "00000000-0000-0000-0000-000000000002",
      toUserId: "00000000-0000-0000-0000-000000000001",
    });
  });

  it("normalizes invalid evidence payloads to an empty list", () => {
    expect(toEvidence({ invalid: true })).toEqual([]);
  });
});
