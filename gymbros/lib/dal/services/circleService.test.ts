import { describe, expect, it, vi } from "vitest";

import { AuthorizationError, ConflictError, RateLimitError } from "../errors";
import type {
  CircleMembership,
  Notification,
  Profile,
  Support,
} from "../types";
import { CircleService } from "./circleService";

const userId = "00000000-0000-0000-0000-000000000001";
const memberId = "00000000-0000-0000-0000-000000000002";

const profile: Profile = {
  id: userId,
  username: "dia",
  name: "Dia",
  avatarUrl: null,
  bio: null,
  visibilityPreference: "circle",
  onboardingCompleted: true,
  timezone: "UTC",
  locale: "en",
  createdAt: "2026-06-22T08:00:00.000Z",
  updatedAt: "2026-06-22T08:00:00.000Z",
  deletedAt: null,
};

const memberProfile: Profile = {
  ...profile,
  id: memberId,
  username: "partner",
  name: "Partner",
};

const pendingMembership: CircleMembership = {
  id: "10000000-0000-0000-0000-000000000001",
  userId,
  circleUserId: memberId,
  status: "pending",
  invitedBy: userId,
  joinedAt: "2026-06-22T08:00:00.000Z",
  endedAt: null,
  createdAt: "2026-06-22T08:00:00.000Z",
  deletedAt: null,
};

const activeMembership: CircleMembership = {
  ...pendingMembership,
  status: "active",
};

// pendingMembership.invitedBy = userId (outgoing). This one is incoming.
const incomingPendingMembership: CircleMembership = {
  ...pendingMembership,
  invitedBy: memberId,
};

const support: Support = {
  id: "20000000-0000-0000-0000-000000000001",
  fromUserId: userId,
  toUserId: memberId,
  message: "Te vi aparecer hoy.",
  createdAt: "2026-06-22T08:00:00.000Z",
  deletedAt: null,
};

const notification: Notification = {
  id: "30000000-0000-0000-0000-000000000001",
  recipientUserId: memberId,
  actorUserId: userId,
  type: "support_received",
  entityType: "support",
  entityId: support.id,
  message: "Dia te envio apoyo.",
  readAt: null,
  createdAt: "2026-06-22T08:00:00.000Z",
  deletedAt: null,
};

function createService() {
  const circle = {
    listCircle: vi.fn().mockResolvedValue([]),
    joinCircle: vi.fn().mockResolvedValue(pendingMembership),
    changeCircleStatus: vi.fn().mockResolvedValue(activeMembership),
    leaveCircle: vi.fn(),
    findMembership: vi.fn().mockResolvedValue(null),
  };
  const supports = {
    sendSupport: vi.fn().mockResolvedValue(support),
    listSupportHistory: vi.fn(),
    listRecentSupportsForProfile: vi.fn().mockResolvedValue([]),
    hasSentSupportSince: vi.fn().mockResolvedValue(false),
    removeSupport: vi.fn(),
  };
  const rpc = {
    getCirclePresence: vi.fn().mockResolvedValue([]),
    getSharedHistory: vi.fn(),
  };
  const profiles = {
    findProfile: vi.fn().mockResolvedValue(profile),
    findProfileByUsername: vi.fn().mockResolvedValue(memberProfile),
  };
  const notifications = {
    createNotification: vi.fn().mockResolvedValue(notification),
  };

  return {
    circle,
    supports,
    rpc,
    profiles,
    notifications,
    service: new CircleService(circle, supports, rpc, profiles, notifications),
  };
}

describe("CircleService", () => {
  it("creates pending invitations and notifies the target", async () => {
    const { circle, notifications, service } = createService();

    await expect(
      service.inviteCircleMember(userId, { username: "partner" })
    ).resolves.toEqual(pendingMembership);

    expect(circle.joinCircle).toHaveBeenCalledWith(userId, {
      circleUserId: memberId,
    });
    expect(notifications.createNotification).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        recipientUserId: memberId,
        type: "circle_invitation",
      })
    );
  });

  it("prevents accepting invitations created by the same profile", async () => {
    const { circle, service } = createService();
    circle.findMembership.mockResolvedValue(pendingMembership);

    await expect(
      service.acceptInvitation(userId, memberId)
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("prevents duplicate daily supports", async () => {
    const { circle, supports, service } = createService();
    circle.findMembership.mockResolvedValue(activeMembership);
    supports.hasSentSupportSince.mockResolvedValue(true);

    await expect(
      service.sendSupport(userId, {
        toUserId: memberId,
        message: support.message,
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("sends support and creates a recipient notification", async () => {
    const { circle, notifications, service } = createService();
    circle.findMembership.mockResolvedValue(activeMembership);

    await expect(
      service.sendSupport(userId, {
        toUserId: memberId,
        message: support.message,
      })
    ).resolves.toEqual(support);

    expect(notifications.createNotification).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        recipientUserId: memberId,
        type: "support_received",
      })
    );
  });

  it("inviteCircleMember rejects self-invite", async () => {
    const { profiles, service } = createService();
    profiles.findProfileByUsername.mockResolvedValue(profile);

    await expect(
      service.inviteCircleMember(userId, { username: "dia" })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("inviteCircleMember rejects when at relationship limit", async () => {
    const { circle, service } = createService();
    const maxMemberships = Array.from({ length: 8 }, (_, i) => ({
      ...activeMembership,
      id: `10000000-0000-0000-0000-00000000000${i + 1}`,
    }));
    circle.listCircle.mockResolvedValue(maxMemberships);

    await expect(
      service.inviteCircleMember(userId, { username: "partner" })
    ).rejects.toBeInstanceOf(RateLimitError);
  });

  it("acceptInvitation activates membership and notifies the sender", async () => {
    const { circle, notifications, service } = createService();
    circle.findMembership.mockResolvedValue(incomingPendingMembership);

    await expect(service.acceptInvitation(userId, memberId)).resolves.toEqual(
      activeMembership
    );

    expect(circle.changeCircleStatus).toHaveBeenCalledWith(userId, {
      circleUserId: memberId,
      status: "active",
    });
    expect(notifications.createNotification).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        recipientUserId: memberId,
        type: "invitation_accepted",
      })
    );
  });

  it("rejectInvitation ends the membership", async () => {
    const { circle, service } = createService();
    circle.findMembership.mockResolvedValue(incomingPendingMembership);

    await service.rejectInvitation(userId, memberId);

    expect(circle.changeCircleStatus).toHaveBeenCalledWith(userId, {
      circleUserId: memberId,
      status: "ended",
    });
  });

  it("rejectInvitation prevents rejecting own outgoing invitation", async () => {
    const { circle, service } = createService();
    circle.findMembership.mockResolvedValue(pendingMembership);

    await expect(
      service.rejectInvitation(userId, memberId)
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("sendSupport rejects self-support", async () => {
    const { service } = createService();

    await expect(
      service.sendSupport(userId, { toUserId: userId, message: "test" })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("sendSupport rejects when no active membership exists", async () => {
    const { service } = createService();

    await expect(
      service.sendSupport(userId, { toUserId: memberId, message: "test" })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});
