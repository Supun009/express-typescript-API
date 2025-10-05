# STAGE 1

FROM node:alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# STAGE 2

FROM node:alpine as production

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app/dist ./dist

COPY prisma ./prisma

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
