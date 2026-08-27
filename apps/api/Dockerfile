# Production Dockerfile for @devlearn/api
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY packages/config/package*.json ./packages/config/
COPY packages/types/package*.json ./packages/types/
COPY packages/ui/package*.json ./packages/ui/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build packages and API
RUN npm run build --workspace=@devlearn/config
RUN npm run build --workspace=@devlearn/types
RUN npm run prisma:generate --workspace=@devlearn/api
RUN npm run build --workspace=@devlearn/api

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: run as non-root user
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages ./packages
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --chown=node:node --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 5000

CMD ["node", "apps/api/dist/server.js"]
