import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { publicUserSelect } from './users.select';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
  async createOne(username: string, email: string, password?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser !== null) {
      throw new ConflictException();
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
      },
    });
    return user;
  }

  /**
   * @brief Updates a user's personal information on the database.
   */
  async updateOne(
    id: string,
    data: { username?: string; email?: string; pictureUrl?: string },
  ) {
    await this.prisma.user.update({
      where: { id: id },
      // If a value is undefined, the value won't be updated
      data: {
        username: data.username,
        email: data.email,
        avatarUrl: data.pictureUrl,
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
}
