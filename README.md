# TypeScript Express API Boilerplate

This is a robust and scalable REST API boilerplate built with Node.js, Express.js, and TypeScript. It includes features like user authentication, role-based access control, and user management, making it a great starting point for your next backend project.

##  Features

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

## 🚀 Getting Started

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
3.  **Set up environment variables:**
    Create a `.env` file in the project root by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and fill in your specific configuration details, such as your database connection string and secret keys.


4.  **Run database migrations:**
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
    ```bash
    npm run dev
    ```

4.  **Run jest testing:**
    ```bash
    npm run test
    ```

The API will be available at `http://localhost:3000` (or the `PORT` you specified).

### Running with Docker

You can also run this application using Docker and Docker Compose.

1.  **Prerequisites:**
    *   [Docker](https://docs.docker.com/get-docker/)
    *   [Docker Compose](https://docs.docker.com/compose/install/)

2.  **Environment Variables:**
    Our `docker-compose.yml` is set up for development and includes a PostgreSQL database service.

    Open the `docker-compose.yml` file and add the following environment variables to the `node-app` service:

    ```yaml
    services:
      # ... (postgres-db service)
      node-app:
        # ... (build, container_name, etc.)
        environment:
          - NODE_ENV=development
          -            DATABASE_URL=postgres://postgres:mysecretpassword@postgres-db:5432/mydb
          - 
        # ... (ports, depends_on, etc.)
    ```

    Replace `database url` with your own secret keys.

3.  **Build and Run:**
    Once you've configured the environment variables, you can build and run the application with a single command:

    ```bash
    docker-compose up --build -d
    ```

    This command will:
    *   Build the Docker image for the Node.js application.
    *   Start the PostgreSQL database and the application in detached mode (`-d`).
    *   The API will be available at `http://localhost:3000`.

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

    The PostgreSQL data is stored in a Docker volume (`postgres-volume`), so your data will be preserved.


## 📝 API Endpoints

Here are the main API routes available:

### Auth Routes (`/api/v1/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Log in a user and receive tokens.
- `POST /logout`: Log out the current user.
- `POST /refresh`: Refresh an expired access token.
- `POST /forgot-password`: Request a password reset email.
- `POST /reset-password`: Reset password with a valid token.

### User Routes (`/api/v1/users`)
- `GET /profile`: Get the current logged-in user's profile.
- `PUT /update`: Update the current user's profile.
- `POST /changepassword`: Change the current user's password.

### Admin Routes (`/api/v1/admin`) - *Admin Only*
- `GET /users`: Get a list of all users (with pagination/filtering).
- `GET users/:id`: Get a single user by ID.
- `PUT users/:id`: Update a user's details (e.g., name, role).
- `DELETE users/:id`: Delete a single user.
- `DELETE users/delete`: Delete multiple users by their IDs (expects an array of IDs in the request body).