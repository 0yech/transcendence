/**
 * @brief Defines what information we're potentially querying from all Oauth2
 * providers.
 * Worth noting that while most fields are optional, emails are mandatory.
 */
export interface OauthPayload {
  username?: string;
  email: string;
  pictureUrl?: string;
}
