# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files explicitly (no wildcard)
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# Copy prisma first
COPY prisma ./prisma

# Copy source
COPY src ./src
COPY nest-cli.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./

# Generate Prisma Client
RUN npx prisma generate

# Build
RUN npm run build


# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy dependency files explicitly
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/nest-cli.json ./

# Security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser -S inventory -u 1001 && \
    chown -R inventory:nodejs /app

USER inventory

EXPOSE 3002

CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && node dist/main"]
