# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npx prisma generate
RUN npm run build


# Stage 2
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN addgroup -g 1001 -S nodejs && \
    adduser -S inventory -u 1001 && \
    chown -R inventory:nodejs /app

USER inventory

EXPOSE 3002

CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && node dist/main"]
