import {
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
   */
  async updateOne(
    id: string,
    data: {
      username?: string;
      email?: string;
      passwordHash?: string;
      pictureUrl?: string;
    },
  ) {
    await this.prisma.user.update({
      where: { id: id, deleted: false },
      // If a value is undefined, the value won't be updated
      data: {
        username: data.username,
        email: data.email,
        avatarUrl: data.pictureUrl,
        hashedPassword: data.passwordHash,
      },
    });
  }

  /**
   * @brief Remove a specific user account. Only an authenticated user can delete
   * their own account.
   */
  async deleteOne(id: string) {
    await this.prisma.user.update({
      where: { id: id },
      data: {
        deleted: true,
        username: 'deleted_user_' + id,
        email: 'deleted_user_' + id,
        hashedPassword: null,
      },
    });
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
