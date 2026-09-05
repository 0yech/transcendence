# Transcendence API Guide

This document describes the HTTP routes currently exposed by the NestJS backend.

> Source of truth: controller files under `backend/src/`.
>
> All backend routes use the global `/api` prefix.
>
> This guide reflects the repository state reviewed on 2026-08-19.

## Environments

### Development

| Service       | URL / Port                  |
| ------------- | --------------------------- |
| Frontend      | `http://localhost:5173`     |
| Backend       | `http://localhost:3000`     |
| API base URL  | `http://localhost:3000/api` |
| Prisma Studio | `http://localhost:5555`     |

### Production

| Service     | URL / Port                     |
| ----------- | ------------------------------ |
| Frontend    | `https://<host>` on port `443` |
| Backend API | `https://<host>/api`           |

## General API behavior

### Authentication

Authentication uses two HTTP-only cookies:

| Cookie          | Purpose                                      | Path        |
| --------------- | -------------------------------------------- | ----------- |
| `access_token`  | Authenticates protected API requests         | `/`         |
| `refresh_token` | Creates a new access token and ends sessions | `/api/auth` |

The cookies are configured with:

- `httpOnly: true`
- `secure: true`
- `sameSite: "lax"`

Clients must send credentials/cookies with protected requests.

Frontend example:

```ts
fetch("/api/auth/me", {
  credentials: "include",
});
```

### Request validation

NestJS global validation is enabled.

- Unknown body properties are removed/rejected.
- Extra non-whitelisted properties cause a validation error.
- DTO-compatible values may be transformed to their declared types.
- Invalid DTO input normally returns `400 Bad Request`.

### Common status codes

| Status             | Meaning                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `200 OK`           | Request succeeded                                                          |
| `201 Created`      | NestJS default for a successful `POST` without an explicit status override |
| `400 Bad Request`  | Invalid input, invalid state, or malformed authentication data             |
| `401 Unauthorized` | Missing, expired, or invalid access token                                  |
| `403 Forbidden`    | Authenticated user is not allowed to perform the action                    |
| `404 Not Found`    | Requested lobby, game, guild, invitation, or user was not found            |
| `409 Conflict`     | Resource already exists or conflicts with current state                    |

> Exact errors can also be raised by service-layer business rules. Keep this section updated when service behavior changes.

---

# Route summary

| Method   | Route                                           |           Auth | Purpose                                                        |
| -------- | ----------------------------------------------- | -------------: | -------------------------------------------------------------- |
| `GET`    | `/api`                                          |             No | Backend health/basic response                                  |
| `POST`   | `/api/auth/register`                            |             No | Register a user                                                |
| `POST`   | `/api/auth/login`                               |             No | Log in and set auth cookies                                    |
| `GET`    | `/api/auth/:provider`                           |             No | Start OAuth login (`google`, `github`, `fortytwo`)             |
| `GET`    | `/api/auth/:provider/callback`                  |             No | Complete OAuth login and redirect to the frontend              |
| `POST`   | `/api/auth/logout`                              | Refresh cookie | End the current session and clear cookies                      |
| `POST`   | `/api/auth/remove-account`                      |            Yes | Anonymize the authenticated user's account and end the session |
| `POST`   | `/api/auth/refresh`                             | Refresh cookie | Issue a new access-token cookie                                |
| `GET`    | `/api/auth/me`                                  |            Yes | Return the authenticated user's public profile                 |
| `GET`    | `/api/lobbies`                                  |             No | List active lobbies                                            |
| `GET`    | `/api/lobbies/:code`                            |             No | Get a lobby by code                                            |
| `POST`   | `/api/lobbies`                                  |            Yes | Create a lobby                                                 |
| `POST`   | `/api/lobbies/:code/join`                       |            Yes | Join a lobby                                                   |
| `POST`   | `/api/lobbies/leave`                            |            Yes | Leave the user's current lobby                                 |
| `GET`    | `/api/games/:gameId/replay`                     |            Yes | Get a game replay                                              |
| `GET`    | `/api/guilds`                                   |             No | List guilds                                                    |
| `GET`    | `/api/guilds/me`                                |            Yes | Get the authenticated user's guild                             |
| `POST`   | `/api/guilds`                                   |            Yes | Create a guild                                                 |
| `POST`   | `/api/guilds/leave`                             |            Yes | Leave the current guild                                        |
| `DELETE` | `/api/guilds`                                   |            Yes | Delete the current guild                                       |
| `POST`   | `/api/guilds/invitations`                       |            Yes | Invite a user to the guild                                     |
| `GET`    | `/api/guilds/invitations`                       |            Yes | List the user's guild invitations                              |
| `POST`   | `/api/guilds/invitations/:invitationId/accept`  |            Yes | Accept a guild invitation                                      |
| `POST`   | `/api/guilds/invitations/:invitationId/decline` |            Yes | Decline a guild invitation                                     |
| `POST`   | `/api/guilds/members/:memberId/kick`            |            Yes | Remove a member from the guild                                 |
| `POST`   | `/api/guilds/members/:memberId/promote`         |            Yes | Promote a member to officer                                    |
| `POST`   | `/api/guilds/members/:memberId/demote`          |            Yes | Demote an officer to member                                    |
| `POST`   | `/api/guilds/members/:memberId/transfer`        |            Yes | Transfer guild ownership                                       |

---

# Root

## `GET /api`

Checks that the backend is reachable.

**Authentication:** Not required

**Body:** None

**Success response**

```text
Hello World!
```

---

# Authentication

## `POST /api/auth/register`

Creates a user account.

**Authentication:** Not required

**Request body**

```json
{
  "email": "user@example.com",
  "username": "player1",
  "password": "strong-password"
}
```

### Validation

| Field      | Type   | Rules                                   |
| ---------- | ------ | --------------------------------------- |
| `email`    | string | Required, valid email, 4–128 characters |
| `username` | string | Required, maximum 32 characters         |
| `password` | string | Required, 8–64 characters               |

**Success status:** `200 OK`

**Success body:** Empty

**Possible errors**

- `400 Bad Request` — DTO validation failed.
- `409 Conflict` — the username or email already belongs to an existing account.

> Registration creates the account but does not set authentication cookies. Call the login route afterward.

> Deleting an account rewrites its username and email to `deleted_user_<id>`, so both the original name and the original address are free to register again.

### Example

```bash
curl -i \
  -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "player1",
    "password": "strong-password"
  }'
```

## `POST /api/auth/login`

Authenticates a user and sets access and refresh token cookies.

**Authentication:** Not required

**Request body**

```json
{
  "username": "player1",
  "password": "strong-password"
}
```

### Validation

| Field      | Type   | Rules               |
| ---------- | ------ | ------------------- |
| `username` | string | Required, non-empty |
| `password` | string | Required, non-empty |

**Success status:** `200 OK`

**Success body:** Empty

**Side effects**

- Sets the `access_token` cookie.
- Sets the `refresh_token` cookie.

**Possible errors**

- `400 Bad Request` — DTO validation failed.
- `401 Unauthorized` — the username does not exist, including a deleted account's old username, or the password does not match.
- `401 Unauthorized` — the account has no password because it was created through an OAuth provider (`"Please login using your Oauth provider."`).

### Example

```bash
curl -i \
  -c cookies.txt \
  -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "password": "strong-password"
  }'
```

## `GET /api/auth/:provider`

Redirects the browser to the provider's login screen. The matching Passport strategy handles the request, so the backend returns no body of its own.

**Authentication:** Not required

**Body:** None

### Providers

| Provider | Route                | Callback                      |
| -------- | -------------------- | ----------------------------- |
| Google   | `/api/auth/google`   | `/api/auth/google/callback`   |
| GitHub   | `/api/auth/github`   | `/api/auth/github/callback`   |
| 42       | `/api/auth/fortytwo` | `/api/auth/fortytwo/callback` |

> These are navigation targets, not `fetch` targets. Point a link or `window.location` at them, because the provider's login screen has to render in the browser.

## `GET /api/auth/:provider/callback`

Consumes the provider's response, creates or reuses the matching account, and redirects back to the frontend. Shared logic lives in `AuthController.oauthSession()`.

**Authentication:** Not required — the provider's response is the credential

**Body:** None

**Success effect:** Sets the `access_token` and `refresh_token` cookies, then redirects to `${FRONTEND_ORIGIN}profile`.

> Failures are not caught, so they render as a JSON error page in the browser window rather than reaching the SPA. Every current failure mode is a `500`: a strategy's `validate()` rejecting a profile without an email or picture, `UsersService.createUsername()` exhausting its suffixes, or a Prisma error.

## `GET /api/auth/me`

Returns the public profile of the authenticated user.

**Authentication:** Required (`access_token` cookie)

**Body:** None

**Success response:** Public user object selected by `UsersService.findOnePublic()`.

The exact fields are controlled by `backend/src/users/users.select.ts`.

**Possible errors**

- `400 Bad Request` — the access token verified but its payload carries no `username` claim.
- `401 Unauthorized` — missing, expired, or invalid access token.
- `401 Unauthorized` — no account answers to the token's username, because the account was deleted (`"User account was deleted."`).

> `JwtAuthGuard` only verifies the token signature, so a deleted account's access token stays valid until it expires (15 minutes, per `signOptions` in `auth.module.ts`). This route rejects it anyway, and `apiFetch` turns that `401` into a refresh attempt that fails too, redirecting the browser to `/login`.

### Example

```bash
curl -i \
  -b cookies.txt \
  http://localhost:3000/api/auth/me
```

## `POST /api/auth/refresh`

Creates a new access token from the refresh token.

**Authentication:** Requires a valid `refresh_token` cookie

**Body:** None

**Success effect:** Replaces/sets the `access_token` cookie.

**Success body:** Empty

**Possible errors**

- `401 Unauthorized` — no session matches the refresh token, the session is older than two weeks (`SESSION_LIFETIME_MS`), or the account has since been deleted.

### Example

```bash
curl -i \
  -b cookies.txt \
  -c cookies.txt \
  -X POST http://localhost:3000/api/auth/refresh
```

## `POST /api/auth/logout`

Ends the session associated with the refresh token and clears both authentication cookies.

**Authentication:** Requires the `refresh_token` cookie associated with the session

**Body:** None

**Success status:** `200 OK`

**Success body:** Empty

### Example

```bash
curl -i \
  -b cookies.txt \
  -c cookies.txt \
  -X POST http://localhost:3000/api/auth/logout
```

## `POST /api/auth/remove-account`

Anonymizes the authenticated user's account, then ends the session the same way `logout` does. No row is removed from the database.

**Authentication:** Required (`access_token` cookie)

**Body:** None

**Success status:** `200 OK`

**Success body:** Empty

**Side effects**

- Sets `deleted = true` on the `User` row identified by the access token's `sub` claim, rewrites its `username` and `email` to `deleted_user_<id>`, and clears `hashedPassword`. The row itself is kept, along with the user's games, messages, guild invitations, and their lobby and guild membership.
- Rewrites the same values on a repeated call, since the row is found by id, so retrying with an access token issued before deletion is safe.
- Removes the in-memory session attached to the `refresh_token` cookie. A request with a valid access token but no refresh token still anonymizes the account.
- Clears the `access_token` and `refresh_token` cookies.

**Possible errors**

- `400 Bad Request` — the user is a guild `LEADER` and must delegate the role before deleting their account.
- `401 Unauthorized` — missing, expired, or invalid access token.
- `500 Internal Server Error` — the token is valid but no matching user exists (`"Current user is missing"`).

> Both the username and the email are released for reuse. A deleted user who signs in again through OAuth gets a brand-new account, usually under their old username, because `UsersService.createUsername()` now finds it free.

### Example

```bash
curl -i \
  -b cookies.txt \
  -c cookies.txt \
  -X POST http://localhost:3000/api/auth/remove-account
```

---

# Lobbies

## `GET /api/lobbies`

Returns active lobbies.

**Authentication:** Not required

**Body:** None

**Success response:** Array of lobby objects returned by `findActiveLobbies()`.

## `GET /api/lobbies/:code`

Returns a lobby by its public code.

**Authentication:** Not required

### Path parameters

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| `code`    | string | Lobby join/public code |

**Success response:** Lobby object returned by `findLobbyByCode()`.

## `POST /api/lobbies`

Creates a lobby owned by the authenticated user.

**Authentication:** Required

**Request body**

```json
{
  "private": true,
  "password": "optional-password"
}
```

| Field      | Type    | Required | Description                              |
| ---------- | ------- | -------: | ---------------------------------------- |
| `private`  | boolean |       No | Whether the lobby is private             |
| `password` | string  |       No | Password used for protected lobby access |

**Success response:** Created lobby object.

> The controller uses an inline TypeScript body type rather than a validated DTO, so these fields currently have no class-validator rules.

## `POST /api/lobbies/:code/join`

Adds the authenticated user to a lobby.

**Authentication:** Required

### Path parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `code`    | string | Lobby code  |

**Request body**

```json
{
  "password": "optional-password"
}
```

The `password` field is optional and is used for protected lobbies.

**Success response:** Updated/joined lobby state.

## `POST /api/lobbies/leave`

Removes the authenticated user from their current lobby.

**Authentication:** Required

**Body:** None

**Success response:** Service-defined result from `leaveLobby()`.

---

# Games

All game routes were moved to websockets except for the replay GET.

## `GET /api/games/:gameId/replay`

Returns replay information for a game.

### Path parameters

| Parameter | Type   | Description                |
| --------- | ------ | -------------------------- |
| `gameId`  | string | Persistent game identifier |

**Success response:** Replay data of a finished game.

---

# Guilds

## `GET /api/guilds`

Lists guilds.

**Authentication:** Not required

**Body:** None

**Success response:** Array of public guild objects.

The public fields are selected by `backend/src/guilds/guilds.select.ts`.

## `GET /api/guilds/me`

Returns the authenticated user's current guild.

**Authentication:** Required

**Body:** None

**Success response:** Guild object or service-defined no-guild result.

## `POST /api/guilds`

Creates a guild.

**Authentication:** Required

**Request body**

```json
{
  "name": "My Guild"
}
```

| Field  | Type   | Required | Description |
| ------ | ------ | -------: | ----------- |
| `name` | string |      Yes | Guild name  |

**Success response:** Created guild object.

## `POST /api/guilds/leave`

Makes the authenticated user leave their current guild.

**Authentication:** Required

**Body:** None

**Success response:** Service-defined leave result.

## `DELETE /api/guilds`

Deletes the authenticated user's guild.

**Authentication:** Required

**Body:** None

**Typical requirement:** The user must have permission to delete the guild, normally as its owner/leader.

**Success response:** Service-defined deletion result.

## `POST /api/guilds/invitations`

Invites a user to the authenticated user's guild.

**Authentication:** Required

**Request body**

```json
{
  "username": "invited-player"
}
```

| Field      | Type   | Required | Description                    |
| ---------- | ------ | -------: | ------------------------------ |
| `username` | string |      Yes | Username of the user to invite |

**Success response:** Created invitation or service-defined result.

## `GET /api/guilds/invitations`

Returns guild invitations received by the authenticated user.

**Authentication:** Required

**Body:** None

**Success response:** Array of invitation objects.

## `POST /api/guilds/invitations/:invitationId/accept`

Accepts a guild invitation.

**Authentication:** Required

### Path parameters

| Parameter      | Type   | Description         |
| -------------- | ------ | ------------------- |
| `invitationId` | string | Guild invitation ID |

**Body:** None

**Success response:** Updated guild membership or invitation result.

## `POST /api/guilds/invitations/:invitationId/decline`

Declines a guild invitation.

**Authentication:** Required

### Path parameters

| Parameter      | Type   | Description         |
| -------------- | ------ | ------------------- |
| `invitationId` | string | Guild invitation ID |

**Body:** None

**Success response:** Updated invitation result.

## `POST /api/guilds/members/:memberId/kick`

Removes a member from the authenticated user's guild.

**Authentication:** Required

### Path parameters

| Parameter  | Type   | Description              |
| ---------- | ------ | ------------------------ |
| `memberId` | string | User/member ID to remove |

**Body:** None

**Typical requirement:** The requesting user must have guild-management permission.

**Success response:** Updated guild or removal result.

## `POST /api/guilds/members/:memberId/promote`

Promotes a guild member to officer.

**Authentication:** Required

### Path parameters

| Parameter  | Type   | Description               |
| ---------- | ------ | ------------------------- |
| `memberId` | string | User/member ID to promote |

**Body:** None

**Requirements:**

- The authenticated user must be the guild `LEADER`.
- The target user must belong to the same guild.
- The target user must currently be a `MEMBER`.

**Success response:** Updated guild object.

**Possible errors:**

- `400 Bad Request` — target is not a member or does not belong to the guild.
- `403 Forbidden` — authenticated user is not the guild leader.
- `404 Not Found` — target user was not found.

## `POST /api/guilds/members/:memberId/demote`

Demotes a guild officer to member.

**Authentication:** Required

### Path parameters

| Parameter  | Type   | Description              |
| ---------- | ------ | ------------------------ |
| `memberId` | string | User/member ID to demote |

**Body:** None

**Requirements:**

- The authenticated user must be the guild `LEADER`.
- The target user must belong to the same guild.
- The target user must currently be an `OFFICER`.

**Success response:** Updated guild object.

**Possible errors:**

- `400 Bad Request` — target is not an officer or does not belong to the guild.
- `403 Forbidden` — authenticated user is not the guild leader.
- `404 Not Found` — target user was not found.

## `POST /api/guilds/members/:memberId/transfer`

Transfers guild ownership to another guild member.

The target becomes `LEADER` and the previous leader becomes `OFFICER`.

**Authentication:** Required

### Path parameters

| Parameter  | Type   | Description                            |
| ---------- | ------ | -------------------------------------- |
| `memberId` | string | User/member ID that will become leader |

**Body:** None

**Requirements:**

- The authenticated user must be the current guild `LEADER`.
- The target must belong to the same guild.
- The target must currently be a `MEMBER` or `OFFICER`.
- A leader cannot transfer ownership to themselves.

**Success response:** Updated guild object.

**Possible errors:**

- `400 Bad Request` — invalid target or target does not belong to the guild.
- `403 Forbidden` — authenticated user is not the guild leader.
- `404 Not Found` — target user was not found.
