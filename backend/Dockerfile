# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/nest-cli.json ./nest-cli.json

# Security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser -S inventory -u 1001 && \
    chown -R inventory:nodejs /app

USER inventory

EXPOSE 3002

CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && npm run start:prod"]
