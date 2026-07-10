import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GuildInvitationStatus, GuildRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  publicGuildInvitationSelect,
  publicGuildSelect,
} from './guilds.select';

/**
 * @brief Handles guild related routes.
 *
 * Includes endpoints to create, list, retrieve, invite, accept,
 * decline, leave, delete and kick guild members.
 * Routes that modify a user's guild state require a JWT.
 */
@Injectable()
export class GuildsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @brief Retrieves the top public guilds.
   *
   * @return A list of guilds ordered by points.
   */
  async getGuilds() {
    return this.prisma.guild.findMany({
      take: 50,
      orderBy: {
        points: 'desc',
      },
      select: publicGuildSelect,
    });
  }

  /**
   * @brief Retrieves the authenticated user's guild.
   *
   * @param userId The user's JWT payload.
   * @return The user's guild, or null if they are not in one.
   */
  async getMyGuild(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        guildId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!user.guildId) {
      return null;
    }

    return this.prisma.guild.findUnique({
      where: { id: user.guildId },
      select: publicGuildSelect,
    });
  }

  /**
   * @brief Creates a guild and makes the user its leader.
   *
   * @param userId The user's JWT payload.
   * @param name The guild name.
   * @return The newly created guild.
   */
  async createGuild(userId: string, name: string) {
    const cleanName = name?.trim();

    if (!cleanName) {
      throw new BadRequestException('Guild name is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          guildId: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      if (user.guildId) {
        throw new BadRequestException('User is already in a guild');
      }

      const existingGuild = await tx.guild.findUnique({
        where: { name: cleanName },
        select: { id: true },
      });

      if (existingGuild) {
        throw new BadRequestException('Guild name is already taken');
      }

      const guild = await tx.guild.create({
        data: {
          name: cleanName,
          level: 1,
          points: 0,
        },
        select: {
          id: true,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          guildId: guild.id,
          guildRole: GuildRole.LEADER,
        },
      });

      await tx.guildInvitation.updateMany({
        where: {
          receiverId: userId,
          status: GuildInvitationStatus.PENDING,
        },
        data: {
          status: GuildInvitationStatus.CANCELLED,
        },
      });

      return tx.guild.findUniqueOrThrow({
        where: { id: guild.id },
        select: publicGuildSelect,
      });
    });
  }

  /**
   * @brief Removes the user from their guild.
   *
   * Leaders cannot leave their guild and must delete it instead.
   *
   * @param userId The user's JWT payload.
   * @return A success response once the user has left the guild.
   */
  async leaveGuild(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        guildId: true,
        guildRole: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!user.guildId) {
      throw new BadRequestException('User is not in a guild');
    }

    if (user.guildRole === GuildRole.LEADER) {
      throw new BadRequestException(
        'Guild leader cannot leave the guild. Delete it instead.',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        guildId: null,
        guildRole: null,
      },
    });

    return { success: true };
  }

  /**
   * @brief Deletes the authenticated leader's guild.
   *
   * Removes all members from the guild before deleting it.
   *
   * @param userId The user's JWT payload.
   * @return A success response once the guild has been deleted.
   */
  async deleteGuild(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        guildId: true,
        guildRole: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!user.guildId) {
      throw new BadRequestException('User is not in a guild');
    }

    if (user.guildRole !== GuildRole.LEADER) {
      throw new ForbiddenException(
        'Only the guild leader can delete the guild',
      );
    }

    const guildId = user.guildId;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { guildId },
        data: {
          guildId: null,
          guildRole: null,
        },
      });

      await tx.guildInvitation.deleteMany({
        where: { guildId },
      });

      await tx.guild.delete({
        where: { id: guildId },
      });
    });

    return { success: true };
  }

  /**
   * @brief Invites a user to the sender's guild.
   *
   * Only guild leaders and officers can invite users.
   *
   * @param senderId The user's JWT payload.
   * @param username The username of the user to invite.
   * @return The created guild invitation.
   */
  async inviteUser(senderId: string, username: string) {
    const cleanUsername = username?.trim();

    if (!cleanUsername) {
      throw new BadRequestException('Username is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: senderId },
        select: {
          id: true,
          guildId: true,
          guildRole: true,
        },
      });

      if (!sender) {
        throw new NotFoundException(`User with id ${senderId} not found`);
      }

      if (!sender.guildId) {
        throw new BadRequestException('Sender is not in a guild');
      }

      if (
        sender.guildRole !== GuildRole.LEADER &&
        sender.guildRole !== GuildRole.OFFICER
      ) {
        throw new ForbiddenException(
          'Only guild leader and officers can invite users',
        );
      }

      const receiver = await tx.user.findUnique({
        where: { username: cleanUsername },
        select: {
          id: true,
          guildId: true,
        },
      });

      if (!receiver) {
        throw new NotFoundException(`User ${cleanUsername} not found`);
      }

      if (receiver.id === sender.id) {
        throw new BadRequestException('You cannot invite yourself');
      }

      if (receiver.guildId) {
        throw new BadRequestException('User is already in a guild');
      }

      const existingInvitation = await tx.guildInvitation.findFirst({
        where: {
          guildId: sender.guildId,
          receiverId: receiver.id,
          status: GuildInvitationStatus.PENDING,
        },
        select: {
          id: true,
        },
      });

      if (existingInvitation) {
        throw new BadRequestException('User already has a pending invitation');
      }

      return tx.guildInvitation.create({
        data: {
          guildId: sender.guildId,
          senderId: sender.id,
          receiverId: receiver.id,
        },
        select: publicGuildInvitationSelect,
      });
    });
  }

  /**
   * @brief Retrieves pending guild invitations for the user.
   *
   * @param userId The user's JWT payload.
   * @return A list of pending guild invitations.
   */
  async getUserInvitations(userId: string) {
    return this.prisma.guildInvitation.findMany({
      where: {
        receiverId: userId,
        status: GuildInvitationStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: publicGuildInvitationSelect,
    });
  }

  /**
   * @brief Accepts a guild invitation.
   *
   * Adds the authenticated user to a guild as a member
   * and cancels their other pending invitations.
   *
   * @param invitationId The id of the invitation to accept.
   * @param userId The user's JWT payload.
   * @return The guild joined by the authenticated user.
   */
  async acceptInvitation(invitationId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invitation = await tx.guildInvitation.findUnique({
        where: { id: invitationId },
        select: {
          id: true,
          guildId: true,
          receiverId: true,
          status: true,
          receiver: {
            select: {
              id: true,
              guildId: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.receiverId !== userId) {
        throw new ForbiddenException(
          'This invitation does not belong to this user',
        );
      }

      if (invitation.status !== GuildInvitationStatus.PENDING) {
        throw new BadRequestException('Invitation is not pending');
      }

      if (invitation.receiver.guildId) {
        throw new BadRequestException('User is already in a guild');
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          guildId: invitation.guildId,
          guildRole: GuildRole.MEMBER,
        },
      });

      await tx.guildInvitation.update({
        where: { id: invitationId },
        data: {
          status: GuildInvitationStatus.ACCEPTED,
        },
      });

      await tx.guildInvitation.updateMany({
        where: {
          receiverId: userId,
          status: GuildInvitationStatus.PENDING,
          id: {
            not: invitationId,
          },
        },
        data: {
          status: GuildInvitationStatus.CANCELLED,
        },
      });

      return tx.guild.findUniqueOrThrow({
        where: { id: invitation.guildId },
        select: publicGuildSelect,
      });
    });
  }

  /**
   * @brief Declines a pending guild invitation.
   *
   * @param invitationId The id of the invitation to decline.
   * @param userId The user's JWT payload.
   * @return The declined guild invitation.
   */
  async declineInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.guildInvitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        receiverId: true,
        status: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.receiverId !== userId) {
      throw new ForbiddenException(
        'This invitation does not belong to this user',
      );
    }

    if (invitation.status !== GuildInvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not pending');
    }

    return this.prisma.guildInvitation.update({
      where: { id: invitationId },
      data: {
        status: GuildInvitationStatus.DECLINED,
      },
      select: publicGuildInvitationSelect,
    });
  }

  /**
   * @brief Kicks a member from the user's guild
   *
   * Leaders can kick members and officers.
   * Officers can only kick members.
   *
   * @param actorId The user's JWT payload.
   * @param memberId The id of the member to kick.
   * @return The guild after the member has been kicked.
   */
  async kickMember(actorId: string, memberId: string) {
    if (actorId === memberId) {
      throw new BadRequestException('You cannot kick yourself');
    }

    return this.prisma.$transaction(async (tx) => {
      const actor = await tx.user.findUnique({
        where: { id: actorId },
        select: {
          id: true,
          guildId: true,
          guildRole: true,
        },
      });

      if (!actor) {
        throw new NotFoundException(`User with id ${actorId} not found`);
      }

      if (!actor.guildId) {
        throw new BadRequestException('User is not in a guild');
      }

      if (
        actor.guildRole !== GuildRole.LEADER &&
        actor.guildRole !== GuildRole.OFFICER
      ) {
        throw new ForbiddenException(
          'Only guild leader and officers can kick members',
        );
      }

      const member = await tx.user.findUnique({
        where: { id: memberId },
        select: {
          id: true,
          guildId: true,
          guildRole: true,
        },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      if (member.guildId !== actor.guildId) {
        throw new BadRequestException('User is not in your guild');
      }

      if (member.guildRole === GuildRole.LEADER) {
        throw new ForbiddenException('Guild leader cannot be kicked');
      }

      if (
        actor.guildRole === GuildRole.OFFICER &&
        member.guildRole === GuildRole.OFFICER
      ) {
        throw new ForbiddenException('Officers cannot kick other officers');
      }

      await tx.user.update({
        where: { id: memberId },
        data: {
          guildId: null,
          guildRole: null,
        },
      });

      await tx.guildInvitation.updateMany({
        where: {
          receiverId: memberId,
          status: GuildInvitationStatus.PENDING,
        },
        data: {
          status: GuildInvitationStatus.CANCELLED,
        },
      });

      return tx.guild.findUniqueOrThrow({
        where: { id: actor.guildId },
        select: publicGuildSelect,
      });
    });
  }
}
