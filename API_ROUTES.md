# Transcendence API Guide

This document describes the HTTP routes currently exposed by the NestJS backend.

> Source of truth: controller files under `backend/src/`.
>
> All backend routes use the global `/api` prefix.
>
> This guide reflects the repository state reviewed on 2026-08-04.

## Environments

### Development

| Service | URL / Port |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:3000` |
| API base URL | `http://localhost:3000/api` |
| Prisma Studio | `http://localhost:5555` |

### Production

| Service | URL / Port |
|---|---|
| Frontend | `https://<host>` on port `443` |
| Backend API | `https://<host>/api` |

## General API behavior

### Authentication

Authentication uses two HTTP-only cookies:

| Cookie | Purpose | Path |
|---|---|---|
| `access_token` | Authenticates protected API requests | `/` |
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

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | NestJS default for a successful `POST` without an explicit status override |
| `400 Bad Request` | Invalid input, invalid state, or malformed authentication data |
| `401 Unauthorized` | Missing, expired, or invalid access token |
| `403 Forbidden` | Authenticated user is not allowed to perform the action |
| `404 Not Found` | Requested lobby, game, guild, invitation, or user was not found |
| `409 Conflict` | Resource already exists or conflicts with current state |

> Exact errors can also be raised by service-layer business rules. Keep this section updated when service behavior changes.

---

# Route summary

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| `GET` | `/api` | No | Backend health/basic response |
| `POST` | `/api/auth/register` | No | Register a user |
| `POST` | `/api/auth/login` | No | Log in and set auth cookies |
| `POST` | `/api/auth/logout` | Refresh cookie | End the current session and clear cookies |
| `POST` | `/api/auth/refresh` | Refresh cookie | Issue a new access-token cookie |
| `GET` | `/api/auth/me` | Yes | Return the authenticated user's public profile |
| `GET` | `/api/lobbies` | No | List active lobbies |
| `GET` | `/api/lobbies/:code` | No | Get a lobby by code |
| `POST` | `/api/lobbies` | Yes | Create a lobby |
| `POST` | `/api/lobbies/:code/join` | Yes | Join a lobby |
| `POST` | `/api/lobbies/leave` | Yes | Leave the user's current lobby |
| `GET` | `/api/games/:gameId/replay` | Yes | Get a game replay |
| `GET` | `/api/guilds` | No | List guilds |
| `GET` | `/api/guilds/me` | Yes | Get the authenticated user's guild |
| `POST` | `/api/guilds` | Yes | Create a guild |
| `POST` | `/api/guilds/leave` | Yes | Leave the current guild |
| `DELETE` | `/api/guilds` | Yes | Delete the current guild |
| `POST` | `/api/guilds/invitations` | Yes | Invite a user to the guild |
| `GET` | `/api/guilds/invitations` | Yes | List the user's guild invitations |
| `POST` | `/api/guilds/invitations/:invitationId/accept` | Yes | Accept a guild invitation |
| `POST` | `/api/guilds/invitations/:invitationId/decline` | Yes | Decline a guild invitation |
| `POST` | `/api/guilds/members/:memberId/kick` | Yes | Remove a member from the guild |

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

| Field | Type | Rules |
|---|---|---|
| `email` | string | Required, valid email, 4–128 characters |
| `username` | string | Required, maximum 32 characters |
| `password` | string | Required, 8–64 characters |

**Success status:** `200 OK`

**Success body:** Empty

**Possible errors**

- `400 Bad Request` — DTO validation failed.
- `409 Conflict` — user creation returned a conflict, such as an existing username/email.

> Registration currently creates the account but does not set authentication cookies, despite an outdated controller comment suggesting it returns a logged-in JWT. Call the login route afterward.

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

| Field | Type | Rules |
|---|---|---|
| `username` | string | Required, non-empty |
| `password` | string | Required, non-empty |

**Success status:** `200 OK`

**Success body:** Empty

**Side effects**

- Sets the `access_token` cookie.
- Sets the `refresh_token` cookie.

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

## `GET /api/auth/me`

Returns the public profile of the authenticated user.

**Authentication:** Required (`access_token` cookie)

**Body:** None

**Success response:** Public user object selected by `UsersService.findOnePublic()`.

The exact fields are controlled by `backend/src/users/users.select.ts`.

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

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Lobby join/public code |

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

| Field | Type | Required | Description |
|---|---|---:|---|
| `private` | boolean | No | Whether the lobby is private |
| `password` | string | No | Password used for protected lobby access |

**Success response:** Created lobby object.

> The controller uses an inline TypeScript body type rather than a validated DTO, so these fields currently have no class-validator rules.

## `POST /api/lobbies/:code/join`

Adds the authenticated user to a lobby.

**Authentication:** Required

### Path parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | string | Lobby code |

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

| Parameter | Type | Description |
|---|---|---|
| `gameId` | string | Persistent game identifier |

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

| Field | Type | Required | Description |
|---|---|---:|---|
| `name` | string | Yes | Guild name |

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

| Field | Type | Required | Description |
|---|---|---:|---|
| `username` | string | Yes | Username of the user to invite |

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

| Parameter | Type | Description |
|---|---|---|
| `invitationId` | string | Guild invitation ID |

**Body:** None

**Success response:** Updated guild membership or invitation result.

## `POST /api/guilds/invitations/:invitationId/decline`

Declines a guild invitation.

**Authentication:** Required

### Path parameters

| Parameter | Type | Description |
|---|---|---|
| `invitationId` | string | Guild invitation ID |

**Body:** None

**Success response:** Updated invitation result.

## `POST /api/guilds/members/:memberId/kick`

Removes a member from the authenticated user's guild.

**Authentication:** Required

### Path parameters

| Parameter | Type | Description |
|---|---|---|
| `memberId` | string | User/member ID to remove |

**Body:** None

**Typical requirement:** The requesting user must have guild-management permission.

**Success response:** Updated guild or removal result.

