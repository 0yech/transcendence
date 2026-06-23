import { env } from 'process';

export const jwtConstants = {
  secret: env.JWT_SECRET, // Secret to be used by the JWT library
};
