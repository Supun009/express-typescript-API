# Architecture Overview

This project follows a feature-first, layered architecture designed to promote separation of concerns, scalability, and maintainability.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: Bcrypt
- **Validation**: Zod
- **ORM**: Prisma
- **Database**: PostgreSQL

## Core Architectural Layers

The application is divided into several distinct layers, each with a specific responsibility.

## Request Flow Diagram

The following diagram illustrates the request/response lifecycle for both a successful request and an error scenario.

```mermaid
sequenceDiagram
    participant Client
    participant Express App
    participant Middleware
    participant Router
    participant Controller
    participant Service
    participant Prisma ORM
    participant PostgreSQL DB
    participant Global Error Handler

    %% --- Happy Path: Successful Login ---
    box "Successful Request"
    Client->>Express App: POST /api/v1/auth/login
    Express App->>Middleware: Process request
    Middleware->>Router: Forward request
    Router->>Controller: login(req, res)
    Controller->>Controller: Validate request body (Zod)
    Controller->>Service: loginUser(email, password)
    Service->>Prisma ORM: findUser({ where: { email }})
    Prisma ORM->>PostgreSQL DB: SELECT * FROM "User" WHERE email = ...
    PostgreSQL DB-->>Prisma ORM: User data
    Prisma ORM-->>Service: User object
    Service->>Service: Compare password, generate JWTs
    Service-->>Controller: { user, tokens }
    Controller-->>Client: 200 OK Response
    end

    %% --- Error Path ---
    box "Error Handling"
    Client->>Express App: POST /api/v1/some-route
    Express App->>Router: Route request
    Router->>Controller: someFunction()
    Controller->>Service: doSomething()
    Service->>Prisma ORM: Throws Exception (caught by asyncHandler)
    Controller->>Global Error Handler: next(error)
    Global Error Handler-->>Client: 500 Internal Server Error Response
    end
```

### 1. Routes (`src/routes`)

- **Responsibility**: Define the API endpoints, specify HTTP methods, and map them to the appropriate controller functions.
- **Example**: `userRoute.ts` defines endpoints like `/profile` and links them to functions in `userController.ts`.

### 2. Middlewares (`src/middlewares`)

- **Responsibility**: Handle cross-cutting concerns that apply to multiple routes. They are functions that execute before the main route handler.
- **Key Middlewares**:
  - `authMiddleware.ts`: Protects routes by verifying JWT tokens.
  - `globalErrorHandler.ts`: A centralized place to catch and format all application errors.
  - `requestLogger.ts`: Logs incoming HTTP requests.

### 3. Controllers (`src/controllers`)

- **Responsibility**: Act as the bridge between the HTTP layer and the application's business logic. They parse the incoming request (`req`), validate the body/params using Zod DTOs, call the appropriate service layer function, and formulate the HTTP response (`res`).
- **Example**: `authController.ts` handles the logic for user registration and login.

### 4. Services (`src/services`)

- **Responsibility**: Contain the core business logic of the application. Services are responsible for interacting with the database (via the Prisma client), performing calculations, and enforcing business rules. They are completely decoupled from the HTTP layer.
- **Example**: `authService.ts` contains the logic for creating a user in the database, hashing passwords, and generating JWTs.

### 5. DTOs (Data Transfer Objects) (`src/dtos`)

- **Responsibility**: Define the shape and validation rules for incoming request data. We use **Zod** to create schemas that are used in controllers to ensure type safety and data integrity.
- **Example**: `userDto.ts` might define a schema for user registration that requires a valid email and a password of a certain length.

### 6. Database (Prisma)

- **Responsibility**: Manages all database interactions.
- `prisma/schema.prisma`: Defines the database schema, models, and relations.
- `src/config/db.ts`: Exports a singleton instance of the Prisma client.
- **Migrations**: Prisma Migrate is used to manage database schema evolution in a consistent and version-controlled way.

### 7. Utilities (`src/utils`)

- **Responsibility**: A collection of reusable helper functions and classes used across the application.
- **Key Utilities**:
  - `asyncHandler.ts`: A wrapper for async route handlers to automatically catch errors and pass them to the global error handler.
  - `apiResponse.ts`: Standardized success/error response formatters.
  - `AppError.ts`: A custom error class for handling operational errors.
  - `jwt.ts`: Functions for signing and verifying JWTs.
