/**
 * @brief Describes a JSON Web Token's payload for this project.
 */
export interface JwtPayload {
  // sub is conventional in JWT, and means "subject"
  // in this case, it's the user's id
  sub: string;
  username: string;
}
