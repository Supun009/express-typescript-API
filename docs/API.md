# API Documentation

This document provides a detailed overview of the API endpoints available in this boilerplate.

The base URL for all API endpoints is `/api/v1`.

## Auth Routes

**Base Path**: `/api/v1/auth`

| Method | Endpoint           | Description                                 | Access        |
| :----- | :----------------- | :------------------------------------------ | :------------ |
| `POST` | `/register`        | Register a new user.                        | Public        |
| `POST` | `/login`           | Log in a user and receive JWT tokens.       | Public        |
| `POST` | `/logout`          | Log out the current user (revokes session). | Authenticated |
| `POST` | `/refresh`         | Refresh an expired access token.            | Authenticated |
| `POST` | `/forgot-password` | Request a password reset email.             | Public        |
| `POST` | `/reset-password`  | Reset password with a valid token.          | Public        |

### Request/Response Details

#### `POST /register`

- **Body**: `{ "name": "string", "email": "string", "password": "string" }`
- **Response**: `201 Created` with user data.

#### `POST /login`

- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: `200 OK`. Sets `accessToken` and `refreshToken` in HTTP-only cookies.

---

## User Routes

**Base Path**: `/api/v1/users`

| Method | Endpoint          | Description                         | Access        |
| :----- | :---------------- | :---------------------------------- | :------------ |
| `GET`  | `/profile`        | Get the current user's profile.     | Authenticated |
| `PUT`  | `/update`         | Update the current user's profile.  | Authenticated |
| `POST` | `/changepassword` | Change the current user's password. | Authenticated |

### Request/Response Details

#### `PUT /update`

- **Body**: `{ "name": "string" }` (or other updatable fields)
- **Response**: `200 OK` with updated user data.

---

## Admin Routes

**Base Path**: `/api/v1/admin`

All endpoints require `ADMIN` role.

| Method   | Endpoint                   | Description                                          |
| :------- | :------------------------- | :--------------------------------------------------- |
| `GET`    | `/users`                   | Get a list of all users (with pagination/filtering). |
| `GET`    | `/users/:id`               | Get a single user by ID.                             |
| `PUT`    | `/users/:id`               | Update a user's details (e.g., name, role).          |
| `DELETE` | `/users/:id`               | Delete a single user.                                |
| `DELETE` | `/users/delete`            | Delete multiple users by their IDs.                  |
| `GET`    | `/active-sessions`         | Get a list of all active user sessions.              |
| `DELETE` | `/revoke-sessions`         | Revoke all active sessions for a user.               |
| `GET`    | `/users/login-history/:id` | Get the login history of a given user.               |
| `GET`    | `/suspicious-activity`     | Get suspicious activity by IP address.               |

### Request/Response Details

#### `DELETE /users/delete`

- **Body**: `{ "ids": ["string", "string"] }`
- **Response**: `200 OK`.

---

## Health Check Route

**Base Path**: `/api/v1/health`

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
