import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @brief Find and return a user based on username
   */
  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  /**
   * @brief Create new user in the database.
   *
   * @return The newly created User object, as a Promise.
   */
  async createOne(username: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (existingUser !== null) {
      throw new ConflictException();
    }

    // Hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        username: username,
        email: username, // TODO Handle email (login/register pages)
        hashedPassword: hash,
      },
    });
    return user;
  }
}
