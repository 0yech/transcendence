export enum OAuthError {
  // Account was created with username and password
  BASIC_AUTH = 'BASIC_AUTH',
  // Account was created using a different provider
  DIFFERENT_PROVIDER = 'DIFFERENT_PROVIDER',
  // Expected data was missing from what the OAuth provider sent
  MISSING_DATA = 'MISSING_DATA',
}
