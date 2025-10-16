# API Documentation

This document provides a detailed overview of the API endpoints available in this boilerplate.

The base URL for all API endpoints is `/api`.

## Auth Routes

**Base Path**: `/api/auth`

| Method | Endpoint         | Description                                 | Access        |
| :----- | :--------------- | :------------------------------------------ | :------------ |
| `POST` | `/register`      | Register a new user.                        | Public        |
| `POST` | `/login`         | Log in a user and receive JWT tokens.       | Public        |
| `POST` | `/logout`        | Log out the current user (revokes session). | Authenticated |
| `POST` | `/refresh-token` | Refresh an expired access token.            | Authenticated |

### Request/Response Details

#### `POST /register`

- **Body**: `{ "name": "string", "email": "string", "password": "string" }`
- **Response**: `201 Created` with user data.

#### `POST /login`

- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: `200 OK`. Sets `accessToken` and `refreshToken` in HTTP-only cookies.

---

## User Routes

**Base Path**: `/api/users`

| Method | Endpoint    | Description                         | Access        |
| :----- | :---------- | :---------------------------------- | :------------ |
| `GET`  | `/profile`  | Get the current user's profile.     | Authenticated |
| `PUT`  | `/update`   | Update the current user's profile.  | Authenticated |
| `PUT`  | `/password` | Change the current user's password. | Authenticated |

### Request/Response Details

#### `PUT /update`

- **Body**: `{ "name": "string" }` (or other updatable fields)
- **Response**: `200 OK` with updated user data.

---

## Admin Routes

**Base Path**: `/api/admin`

All endpoints require `ADMIN` role.

| Method   | Endpoint                   | Description                           |
| :------- | :------------------------- | :------------------------------------ |
| `GET`    | `/users`                   | Get a list of all users.              |
| `GET`    | `/users/:id`               | Get a single user by ID.              |
| `PUT`    | `/users/:id`               | Update a user's details (e.g., name). |
| `DELETE` | `/users/:id`               | Delete a single user.                 |
| `DELETE` | `/users/delete`            | Delete users.                         |
| `GET`    | `/active-session`          | Get active sessions.                  |
| `GET`    | `/suspicious-activity`     | Get suspicious activity.              |
| `DELETE` | `/revoke-sessions`         | Revoke sessions.                      |
| `DELETE` | `/users/login-history/:id` | Delete user loging history.           |

---

## Health Check Route

**Base Path**: `/api/health`

| Method | Endpoint | Description                                                                  | Access |
| :----- | :------- | :--------------------------------------------------------------------------- | :----- |
| `GET`  | `/`      | Health check endpoint to verify API status, database connection, and memory. | Public |

### Response Details

#### `GET /`

- **Response**: `200 OK` or `503 Service Unavailable`

```json
{
  "success": true,
  "message": "Health check",
  "data": {
    "database": {
      "status": "pass",
      "responseTime": "422ms"
    },
    "memory": {
      "status": "pass",
      "heapUsed": "21MB",
      "heapTotal": "56MB"
    },
    "uptime": 13.9085833
  },
  "meta": {
    "timestamp": "2025-10-12T13:35:51.815Z"
  }
}
```
