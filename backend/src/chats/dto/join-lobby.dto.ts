import { IsNotEmpty, IsString } from 'class-validator';

/**
 * @brief Validates the payload of the `lobby:join` event.
 *
 * The code goes into a Prisma `where` clause. Without this, a client could
 * send an object such as `{ "not": "" }`, which Prisma reads as a filter
 * rather than as the code to look up.
 */
export class JoinLobbyDto {
  @IsString({ message: 'The lobby code must be text.' })
  @IsNotEmpty({ message: 'A lobby code is required.' })
  code!: string;
}
