# STAGE 1: Builder Stage
# This stage installs all dependencies (including dev) and builds the TypeScript source.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies.
# This layer is cached as long as package*.json files don't change.
COPY package*.json ./
RUN npm install --include=dev

# Copy the rest of the application source code.
# This allows Docker to cache the `npm install` step above.
COPY . .

RUN npx prisma generate

# Build the application.
RUN npm run build

# STAGE 2: Production Stage
# This stage creates a smaller, optimized image for production.
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files again.
COPY package*.json ./

# Copy node_modules from the builder stage and prune dev dependencies.
# This is much faster than running `npm install --only=production` from scratch.
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --production

# Copy the built application from the builder stage.
COPY --from=builder /app/dist ./dist
# Copy the prisma schema for client generation.
COPY prisma ./prisma

# Generate the Prisma client for the production environment.
RUN npx prisma generate

EXPOSE 3000

CMD [ "node", "dist/src/index.js" ]
