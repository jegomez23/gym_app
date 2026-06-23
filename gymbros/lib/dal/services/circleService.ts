import type {
  ChangeCircleStatusInput,
  InviteCircleMemberInput,
  JoinCircleInput,
  SendSupportInput,
} from "../schemas";
import type {
  CircleMembership,
  CirclePresence,
  Notification,
  Profile,
  SharedHistory,
  Support,
} from "../types";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  RateLimitError,
} from "../errors";

const MAX_CIRCLE_RELATIONSHIPS = 8;

type CircleDataAccess = {
  listCircle(profileId: string): Promise<CircleMembership[]>;
  joinCircle(
    profileId: string,
    input: JoinCircleInput
  ): Promise<CircleMembership>;
  changeCircleStatus(
    profileId: string,
    input: ChangeCircleStatusInput
  ): Promise<CircleMembership>;
  leaveCircle(
    profileId: string,
    input: JoinCircleInput
  ): Promise<CircleMembership>;
  findMembership(
    profileId: string,
    otherProfileId: string
  ): Promise<CircleMembership | null>;
};

type SupportDataAccess = {
  sendSupport(profileId: string, input: SendSupportInput): Promise<Support>;
  listSupportHistory(
    profileId: string,
    otherProfileId: string
  ): Promise<Support[]>;
  listRecentSupportsForProfile(
    profileId: string,
    limit?: number
  ): Promise<Support[]>;
  hasSentSupportSince(
    fromUserId: string,
    toUserId: string,
    since: string
  ): Promise<boolean>;
  removeSupport(supportId: string): Promise<Support>;
};

type ProfileDataAccess = {
  findProfile(profileId: string): Promise<Profile>;
  findProfileByUsername(username: string): Promise<Profile | null>;
};

type NotificationAccess = {
  createNotification(
    actorUserId: string,
    input: {
      recipientUserId: string;
      type: Notification["type"];
      entityType?: Notification["entityType"];
      entityId?: string | null;
      message: string;
    }
  ): Promise<Notification>;
};

type CircleRpcAccess = {
  getCirclePresence(
    profileId: string,
    since?: string
  ): Promise<CirclePresence[]>;
  getSharedHistory(
    otherProfileId: string,
    limit?: number
  ): Promise<SharedHistory | null>;
};

export class CircleService {
  constructor(
    private readonly circle: CircleDataAccess,
    private readonly supports: SupportDataAccess,
    private readonly rpc: CircleRpcAccess,
    private readonly profiles: ProfileDataAccess,
    private readonly notifications: NotificationAccess
  ) {}

  listCircle(profileId: string): Promise<CircleMembership[]> {
    return this.circle.listCircle(profileId);
  }

  joinCircle(
    profileId: string,
    input: JoinCircleInput
  ): Promise<CircleMembership> {
    return this.circle.joinCircle(profileId, input);
  }

  async inviteCircleMember(
    profileId: string,
    input: InviteCircleMemberInput
  ): Promise<CircleMembership> {
    const [profile, target, memberships] = await Promise.all([
      this.profiles.findProfile(profileId),
      this.profiles.findProfileByUsername(input.username),
      this.circle.listCircle(profileId),
    ]);

    if (!target) {
      throw new NotFoundError("No encontramos ese username.");
    }

    if (target.id === profileId) {
      throw new AuthorizationError("No puedes invitarte a tu propio Circle.");
    }

    const activeOrPendingCount = memberships.filter(
      (membership) =>
        membership.status === "active" || membership.status === "pending"
    ).length;

    if (activeOrPendingCount >= MAX_CIRCLE_RELATIONSHIPS) {
      throw new RateLimitError("Tu Circle ya alcanzo el limite MVP.");
    }

    const existing = await this.circle.findMembership(profileId, target.id);

    if (existing?.status === "active") {
      throw new ConflictError("Ese perfil ya esta en tu Circle.");
    }

    if (existing?.status === "pending") {
      throw new ConflictError("Ya hay una invitacion pendiente.");
    }

    const membership = await this.circle.joinCircle(profileId, {
      circleUserId: target.id,
    });

    await this.notifications.createNotification(profileId, {
      recipientUserId: target.id,
      type: "circle_invitation",
      entityType: "circle_membership",
      entityId: membership.id,
      message: `${profile.name} te invito a su Circle.`,
    });

    return membership;
  }

  changeCircleStatus(
    profileId: string,
    input: ChangeCircleStatusInput
  ): Promise<CircleMembership> {
    return this.circle.changeCircleStatus(profileId, input);
  }

  leaveCircle(
    profileId: string,
    input: JoinCircleInput
  ): Promise<CircleMembership> {
    return this.circle.leaveCircle(profileId, input);
  }

  async acceptInvitation(
    profileId: string,
    fromUserId: string
  ): Promise<CircleMembership> {
    const membership = await this.circle.findMembership(profileId, fromUserId);

    if (!membership || membership.status !== "pending") {
      throw new NotFoundError("No hay una invitacion pendiente.");
    }

    if (membership.invitedBy === profileId) {
      throw new AuthorizationError("No puedes aceptar tu propia invitacion.");
    }

    const [accepted, profile] = await Promise.all([
      this.circle.changeCircleStatus(profileId, {
        circleUserId: fromUserId,
        status: "active",
      }),
      this.profiles.findProfile(profileId),
    ]);

    await this.notifications.createNotification(profileId, {
      recipientUserId: fromUserId,
      type: "invitation_accepted",
      entityType: "circle_membership",
      entityId: accepted.id,
      message: `${profile.name} acepto tu invitacion al Circle.`,
    });

    return accepted;
  }

  async rejectInvitation(
    profileId: string,
    fromUserId: string
  ): Promise<CircleMembership> {
    const membership = await this.circle.findMembership(profileId, fromUserId);

    if (!membership || membership.status !== "pending") {
      throw new NotFoundError("No hay una invitacion pendiente.");
    }

    if (membership.invitedBy === profileId) {
      throw new AuthorizationError("No puedes rechazar tu propia invitacion.");
    }

    return this.circle.changeCircleStatus(profileId, {
      circleUserId: fromUserId,
      status: "ended",
    });
  }

  removeMember(
    profileId: string,
    otherProfileId: string
  ): Promise<CircleMembership> {
    return this.circle.changeCircleStatus(profileId, {
      circleUserId: otherProfileId,
      status: "ended",
    });
  }

  getCirclePresence(
    profileId: string,
    since?: string
  ): Promise<CirclePresence[]> {
    return this.rpc.getCirclePresence(profileId, since);
  }

  getSharedHistory(
    otherProfileId: string,
    limit?: number
  ): Promise<SharedHistory | null> {
    return this.rpc.getSharedHistory(otherProfileId, limit);
  }

  async sendSupport(
    profileId: string,
    input: SendSupportInput
  ): Promise<Support> {
    if (profileId === input.toUserId) {
      throw new AuthorizationError("No puedes enviarte apoyo a ti mismo.");
    }

    const membership = await this.circle.findMembership(
      profileId,
      input.toUserId
    );

    if (!membership || membership.status !== "active") {
      throw new AuthorizationError("El apoyo requiere un Circle activo.");
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (
      await this.supports.hasSentSupportSince(
        profileId,
        input.toUserId,
        today.toISOString()
      )
    ) {
      throw new ConflictError("Ya enviaste apoyo a este miembro hoy.");
    }

    const [support, profile] = await Promise.all([
      this.supports.sendSupport(profileId, input),
      this.profiles.findProfile(profileId),
    ]);

    await this.notifications.createNotification(profileId, {
      recipientUserId: input.toUserId,
      type: "support_received",
      entityType: "support",
      entityId: support.id,
      message: `${profile.name} te envio apoyo: ${support.message}`,
    });

    return support;
  }

  listSupportHistory(
    profileId: string,
    otherProfileId: string
  ): Promise<Support[]> {
    return this.supports.listSupportHistory(profileId, otherProfileId);
  }

  removeSupport(supportId: string): Promise<Support> {
    return this.supports.removeSupport(supportId);
  }

  listRecentSupportsForProfile(
    profileId: string,
    limit?: number
  ): Promise<Support[]> {
    return this.supports.listRecentSupportsForProfile(profileId, limit);
  }
}
