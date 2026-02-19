# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY backend/package.json ./
COPY backend/package-lock.json ./
RUN npm ci

# Copy source files
COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/nest-cli.json ./

# Generate Prisma Client
RUN npx prisma generate

# Build
RUN npm run build


# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

COPY backend/package.json ./
COPY backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN addgroup -g 1001 -S nodejs && \
    adduser -S inventory -u 1001 && \
    chown -R inventory:nodejs /app

USER inventory

EXPOSE 3002

CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && node dist/main"]
