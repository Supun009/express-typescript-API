# Deployment Guide

This guide provides instructions for deploying the application to a production environment.

## Prerequisites

- A server or platform (e.g., AWS EC2, DigitalOcean, Heroku, Vercel).
- Node.js (v18.x or newer) installed on the server.
- A managed PostgreSQL database (e.g., AWS RDS, ElephantSQL) or PostgreSQL installed on your server.
- A process manager like **PM2** to keep the application running.

## Production Build Steps

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Supun009/express-typescript-API.git
    cd express-typescript-API
    ```

2.  **Install Dependencies**:
    Install only the production dependencies.
    ```bash
    npm install --production
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the project root and fill it with your production-level configuration.

    **Important Production Settings**:
    - `NODE_ENV`: Set to `production`. This enables optimizations in Express and other libraries.
    - `DATABASE_URL`: Your production PostgreSQL connection string.
    - `CLIENT_URL`: The URL of your frontend application.
    - `ACCESS_JWT_SECRET` & `REFRESH_JWT_SECRET`: Use strong, randomly generated secrets.
    - `LOG_LEVEL`: Set to `info` or `warn` to avoid excessive logging.

4.  **Apply Database Migrations**:
    Before starting the application, ensure your database schema is up-to-date.
    ```bash
    npx prisma migrate deploy
    ```
    The `deploy` command is recommended for production as it applies pending migrations without generating new ones.

5.  **Build the TypeScript Code**:
    Compile the TypeScript source code into JavaScript in the `dist` directory.
    ```bash
    npm run build
    ```

6.  **Start the Application with PM2**:
    PM2 is a production process manager for Node.js applications that provides features like load balancing, auto-restart, and log management.

    Install PM2 globally:
    ```bash
    npm install pm2 -g
    ```

    Start the application:
    ```bash
    pm2 start dist/index.js --name "my-api"
    ```

    Your API is now running. You can monitor it with `pm2 list` or `pm2 monit`.