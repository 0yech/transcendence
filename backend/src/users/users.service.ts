import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  publicUserSelect,
  userIdentitySelect,
  publicViewUserSelect,
} from './users.select';
import { sniffImageMimeType } from './avatar.util';
import { OAuthProvider } from 'src/generated/prisma/enums';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @brief Find and return a user based on its id. Preferred where possible.
   * The result must never be returned to the frontend.
   */
  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  /**
   * @brief Find and return a user based on username. The result must never be
   * returned to the frontend.
   */
  async findOneUsername(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  /**
   * @brief Find a non-deleted user by id and return only frontend-safe
   * identity information.
   */
  async findIdentityById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deleted: false,
      },
      select: userIdentitySelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /**
   * @brief Find a non-deleted user by username and return only frontend-safe
   * identity information.
   */
  async findIdentityByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
        deleted: false,
      },
      select: userIdentitySelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /**
   * @brief Find and return a user based on email. The result must never be
   * returned to the frontend.
   */
  async findOneEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  /**
   * @brief Find and return a user based on username, only containing publicly
   * accessible information.
   */
  async findOnePublic(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: publicUserSelect,
    });
  }

  /**
   * @brief Create new user in the database.
   *
   * @return The newly created User object, as a Promise.
   */
  async createOne(
    username: string,
    email: string,
    password?: string,
    oauthProvider?: OAuthProvider,
  ) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser !== null) {
      throw new ConflictException('Email or username already exists.');
    }

    let hash = undefined;
    if (password) {
      // Hash password
      const saltRounds = 10;
      hash = await bcrypt.hash(password, saltRounds);
    }

    const user = await this.prisma.user.create({
      data: {
        username: username,
        email: email,
        hashedPassword: hash,
        oauthProvider: oauthProvider,
      },
    });
    return user;
  }

  /**
   * @brief Updates a user's personal information on the database.
   *
   * An uploaded file wins over a `pictureUrl`: the file is stored, and the URL
   * we generate for it replaces whatever the caller passed.
   *
   * @returns The user's avatar URL after the update, so the caller doesn't have
   * to re-read the account to learn it.
   */
  async updateOne(
    id: string,
    data: {
      username?: string;
      email?: string;
      passwordHash?: string;
      pictureUrl?: string;
      pictureFile?: Express.Multer.File;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Checked up front so we fail before writing megabytes into a
      // transaction that the update below would only roll back.
      const user = await tx.user.findFirst({
        where: { id: id, deleted: false },
        select: { id: true },
      });
      if (user === null) {
        throw new NotFoundException('User not found.');
      }

      let avatarUrl = data.pictureUrl;

      if (data.pictureFile) {
        const mimeType = sniffImageMimeType(data.pictureFile.buffer);
        if (mimeType === null) {
          throw new BadRequestException(
            'Your avatar must be a PNG, JPEG, WebP, or GIF image.',
          );
        }

        // Copied into a plain Uint8Array: multer hands back a Buffer typed
        // over ArrayBufferLike, which Prisma's Bytes input won't accept.
        const bytes = new Uint8Array(data.pictureFile.buffer);

        const avatar = await tx.avatar.upsert({
          where: { userId: id },
          create: { userId: id, bytes: bytes, mimeType },
          update: { bytes: bytes, mimeType },
          select: { updatedAt: true },
        });

        // The version makes every upload a URL the browser has never seen, so
        // the bytes behind it can be cached forever without going stale.
        avatarUrl = `/api/users/public/avatar/${id}?v=${avatar.updatedAt.getTime()}`;
      } else if (data.pictureUrl) {
        // Switching to an external picture leaves the stored one unreachable.
        await tx.avatar.deleteMany({ where: { userId: id } });
      }

      const updated = await tx.user.update({
        where: { id: id, deleted: false },
        // If a value is undefined, the value won't be updated
        data: {
          username: data.username,
          email: data.email,
          avatarUrl: avatarUrl,
          hashedPassword: data.passwordHash,
        },
        select: { avatarUrl: true },
      });

      return updated.avatarUrl;
    });
  }

  /**
   * @brief Returns a user's uploaded profile picture.
   *
   * A missing picture and a deleted account are both a plain 404, so the route
   * doesn't reveal which accounts exist.
   */
  async getProfilePicture(userId: string) {
    const avatar = await this.prisma.avatar.findFirst({
      where: { userId: userId, user: { deleted: false } },
      select: { bytes: true, mimeType: true, updatedAt: true },
    });

    if (avatar === null) {
      throw new NotFoundException('This user has no uploaded avatar.');
    }

    return avatar;
  }

  /**
   * @brief Remove a specific user account. Only an authenticated user can delete
   * their own account.
   */
  async deleteOne(id: string) {
    await this.prisma.$transaction([
      // The account is only ever soft-deleted, so the cascade on Avatar never
      // fires and the picture has to be removed by hand. deleteMany rather
      // than delete: most users never uploaded one, and delete would throw.
      this.prisma.avatar.deleteMany({ where: { userId: id } }),
      this.prisma.user.update({
        where: { id: id },
        data: {
          deleted: true,
          username: 'deleted_user_' + id,
          email: 'deleted_user_' + id,
          hashedPassword: null,
          avatarUrl: null,
        },
      }),
    ]);
  }

  /**
   * @brief Creates a unique username for a given email. Checks for existing
   * usernames, and appends a number if a username already exists.
   */
  async createUsername(email: string) {
    const atIndex = email.indexOf('@');
    const username = email.substring(0, atIndex);

    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    // Avoid naming collisions
    if (existingUser !== null) {
      for (let index = 1; index < 100; ++index) {
        const newUsername = username + index;
        const existingUser = await this.prisma.user.findUnique({
          where: {
            username: newUsername,
          },
        });
        if (!existingUser) {
          return newUsername;
        }
      }
      throw new InternalServerErrorException(
        "Couldn't create a unique username; try creating an account normally instead.",
      );
    }

    return username;
  }

  /**
   * @brief Find a non-deleted user by ID and return public information front-end safe
   * identity information.
   */
  async findPublicIdentityById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: id,
      },
      select: publicViewUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.deleted) {
      throw new NotFoundException('User has been deleted.');
    }

    return user;
  }

  /**
   * @brief Find a non-deleted user by ID and return public information front-end safe
   * identity information.
   */
  async findPublicIdentityByUser(username: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
      select: publicViewUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.deleted) {
      throw new NotFoundException('User has been deleted.');
    }

    return user;
  }
}
