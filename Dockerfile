# STAGE 1

FROM node:alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# STAGE 2

FROM node:alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app/dist ./dist

COPY prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD [ "node", "dist/src/index.js" ]
