# TypeScript Express API Boilerplate

[![Build Status](https://img.shields.io/github/actions/workflow/status/Supun009/express-typescript-API/ci.yml?branch=main)](https://github.com/Supun009/express-typescript-API/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

This is a robust and scalable REST API boilerplate built with Node.js, Express.js, and TypeScript. It includes features like user authentication, role-based access control, and user management, making it a great starting point for your next backend project.

## 📚 Documentation

- **[API Documentation](./docs/API.md)**: Detailed information about all API endpoints.
- **[Architecture Overview](./docs/ARCHITECTURE.md)**: An in-depth look at the project structure and design patterns.
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Instructions for deploying the application to production.
- **[Contributing Guide](./CONTRIBUTING.md)**: How to contribute to the project.

## ✨ Features

- **Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
- **Access & Refresh Tokens**: Implements a secure token-based authentication flow with access and refresh tokens stored in HTTP-only cookies.
- **Password Management**: Secure password hashing using bcrypt, with endpoints for changing and resetting passwords.
- **Role-Based Access Control (RBAC)**: Middleware to protect routes based on user roles (e.g., `ADMIN` vs. `USER`).
- **User Management**:
  - Users can view and update their own profiles.
  - Admins can perform CRUD operations on all users.
- **Validation**: Strong, type-safe request validation using Zod.
- **Structured & Scalable**: Organized project structure with controllers, services, DTOs, and utility functions.
- **Async Error Handling**: A custom `asyncHandler` utility to gracefully handle errors in asynchronous route handlers.
- **TypeScript**: Full TypeScript support for type safety and improved developer experience.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: Bcrypt
- **Validation**: Zod
- **ORM**: Prisma
- **Database**: PostgreSQL

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or newer recommended)
- npm or yarn
- A running PostgreSQL database instance

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

    | Variable             | Description                                          | Example                                                        |
    | -------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
    | `DATABASE_URL`       | Your full PostgreSQL connection string.              | `postgresql://postgres:mysecretpassword@localhost:5432/mydb`   |
    | `CLIENT_URL`         | The client origin allowed to access the API.         | `http://localhost:3001`                                        |
    | `NODE_ENV`           | The environment in which the application is running. | `development` or `production`                                  |
    | `LOG_LEVEL`          | The log level for the application.                   | `info`                                                         |
    | `PORT`               | The port the application will run on.                | `3000`                                                         |
    | `ACCESS_JWT_SECRET`  | Secret key for signing JWT access tokens.            | `your_super_secret_access_token_key_min_32_chars_long_abc123`  |
    | `REFRESH_JWT_SECRET` | Secret key for signing JWT refresh tokens.           | `your_super_secret_refresh_token_key_min_32_chars_long_xyz789` |

4.  **Apply Database Migrations:**
    Make sure your PostgreSQL database server is running and the `DATABASE_URL` in your `.env` file is correct. Then, run the following command to apply the database schema:
    ```bash
    npx prisma migrate dev
    ```
    This will create the necessary tables in your database based on the schema defined in `prisma/schema.prisma`.

### Running the Application

1.  **Compile TypeScript:**

    ```bash
    npm run build
    ```

2.  **Start the server:**

    ```bash
    npm start
    ```

3.  **Run in development mode (with hot-reloading):**
    `bash
    npm run dev
    `
    The API will be available at `http://localhost:3000` (or the `PORT` you specified).

### Running with Docker

You can also run this application using Docker and Docker Compose.

1.  **Prerequisites:**
    - [Docker](https://docs.docker.com/get-docker/)
    - [Docker Compose](https://docs.docker.com/compose/install/)

2.  **Docker-compose.yml:**
    Our `docker-compose.yml` is set up for development and includes a PostgreSQL database service.

3.  **Build and Run:**
    Once you've configured the environment variables, you can build and run the application with a single command:

    ```bash
    docker-compose up --build -d
    ```

    This command will:
    - Build the Docker image for the Node.js application.
    - Start the PostgreSQL database and the application in detached mode (`-d`).
    - The API will be available at `http://localhost:3000`.

4.  **Database Migrations:**
    When the application starts, it will automatically connect to the database. To run the database migrations, you can execute the following command in a separate terminal:

    ```bash
    docker-compose exec node-app npx prisma migrate dev
    ```

5.  **Stopping the Application:**
    To stop and remove the containers, run:
    ```bash
    docker-compose down
    ```
    _The PostgreSQL data is stored in a Docker volume (`postgres-volume`), so your data will be preserved across restarts._

## 🧪 Testing

This project uses Jest for running unit and integration tests. To run the test suite, use the following commands:

```bash
npm run test
```

this will run all tests together.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.
