# TypeScript Express API

[![Build Status](https://img.shields.io/github/actions/workflow/status/Supun009/express-typescript-API/ci.yml?branch=main)](https://github.com/Supun009/express-typescript-API/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

This is a robust and scalable REST API built with Node.js, Express.js, and TypeScript. It includes features like user authentication, role-based access control, and user management, making it a great starting point for your next backend project.

## 📚 Documentation

- **[API Documentation](./docs/API.md)**: Detailed information about all API endpoints.
- **[Architecture Overview](./docs/ARCHITECTURE.md)**: An in-depth look at the project structure and design patterns.
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Instructions for deploying the application to production.
- **[Contributing Guide](./CONTRIBUTING.md)**: How to contribute to the project.
- **[Folder Structure](./docs/folder_structure.md)**: An overview of the project's folder structure.

## ✨ Features

- **Authentication & Authorization**: Secure, cookie-based authentication with JWT (Access and Refresh tokens). Includes role-based access control (RBAC) for protecting routes.
- **User Management**: Complete CRUD operations for users, with secure password handling (hashing with bcrypt).
- **Session Management**: Users can view and revoke their active sessions.
- **Security**:
  - **CORS**: Configured to allow requests only from whitelisted domains.
  - **Helmet**: Protects against common web vulnerabilities.
  - **Rate Limiting**: Guards against brute-force attacks.
  - **HTTP-Only Cookies**: For storing tokens, preventing XSS attacks.
- **Request Validation**: Strong, type-safe validation using Zod.
- **Database**: Uses Prisma ORM for type-safe database access and schema management.
- **Logging**: Structured, asynchronous logging with Pino.
- **Error Handling**: Centralized error handling middleware.
- **API Documentation**: Automatically generated API documentation with Swagger.
- **Developer Experience**:
  - **TypeScript**: For type safety and improved code quality.
  - **ESLint & Prettier**: For consistent code style.
  - **Hot-reloading**: For a fast development workflow.
  - **Dockerized**: For easy setup and deployment.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Logging**: Pino
- **API Documentation**: Swagger
- **Testing**: Jest, Supertest

## Folder Structure

The project follows a feature-based architecture, with a clear separation of concerns. For a detailed overview, see the [Folder Structure](./docs/folder_structure.md) documentation.

```
/
├── docs/                  # Documentation files
├── prisma/                # Database schema and migrations
├── src/
│   ├── config/            # Configuration files (e.g., database)
│   ├── constants/         # Project-wide constants
│   ├── controllers/       # Express route handlers
│   ├── dtos/              # Data Transfer Objects (for request/response validation)
│   ├── middlewares/       # Custom Express middlewares
│   ├── routes/            # Express routes
│   ├── services/          # Business logic
│   ├── types/             # Custom type definitions
│   └── utils/             # Utility functions
├── tests/                 # Test files
├── .env.example           # Example environment variables
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Dockerfile for the application
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or newer recommended)
- npm or yarn
- A running PostgreSQL database instance
- Docker (optional, for running with Docker)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Supun009/express-typescript-API.git
    cd express-typescript-API
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the project root by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Then, open the `.env` file and fill in the required values.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Your full PostgreSQL connection string. | `postgresql://postgres:mysecretpassword@localhost:5432/mydb` |
| `CLIENT_URL` | The client origin allowed to access the API. | `http://localhost:3001` |
| `NODE_ENV` | The environment in which the application is running. | `development` or `production` |
| `LOG_LEVEL` | The log level for the application. | `info` |
| `PORT` | The port the application will run on. | `3000` |
| `ACCESS_JWT_SECRET` | Secret key for signing JWT access tokens. | `your_super_secret_access_token_key_min_32_chars_long_abc123` |
| `REFRESH_JWT_SECRET` | Secret key for signing JWT refresh tokens. | `your_super_secret_refresh_token_key_min_32_chars_long_xyz789` |

4.  **Apply Database Migrations:**
    Make sure your PostgreSQL database server is running and the `DATABASE_URL` in your `.env` file is correct. Then, run the following command to apply the database schema:
    ```bash
    npx prisma migrate dev
    ```
    This will create the necessary tables in your database based on the schema defined in `prisma/schema.prisma`.

### Running the Application

1.  **Start the server in development mode (with hot-reloading):**

    ```bash
    npm run dev
    ```

    The API will be available at `http://localhost:3000` (or the `PORT` you specified).

2.  **Build and run for production:**

    ```bash
    npm run build
    npm start
    ```

### API Documentation

This project uses Swagger to provide interactive API documentation. Once the server is running, you can access the documentation at `http://localhost:3000/api-docs`.

The Swagger documentation is automatically generated from the JSDoc comments in the route files. To regenerate the documentation, run the following command:

```bash
npm run swagger-gen
```

### Running with Docker

You can also run this application using Docker and Docker Compose.

1.  **Build and Run:**
    Once you've configured the environment variables, you can build and run the application with a single command:

    ```bash
    docker-compose up --build -d
    ```

    This command will:
    - Build the Docker image for the Node.js application.
    - Start the PostgreSQL database and the application in detached mode (`-d`).
    - The API will be available at `http://localhost:3000`.

2.  **Database Migrations:**
    When the application starts, it will automatically connect to the database. To run the database migrations, you can execute the following command in a separate terminal:

    ```bash
    docker-compose exec node-app npx prisma migrate dev
    ```

3.  **Stopping the Application:**
    To stop and remove the containers, run:
    ```bash
    docker-compose down
    ```
    _The PostgreSQL data is stored in a Docker volume (`postgres-volume`), so your data will be preserved across restarts._

## 🧪 Testing

This project uses Jest for running unit and integration tests. To run the test suite, use the following command:

```bash
npm run test
```

This will run all tests together.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.
