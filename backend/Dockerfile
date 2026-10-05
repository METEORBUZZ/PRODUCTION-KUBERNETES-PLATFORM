# ==========================================
# Stage 1: Build TypeScript Application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN npm prune --production

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

ENV NODE_ENV=production \
    PORT=8080 \
    APP_VERSION=1.0.0

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER 10001:10001

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/health || exit 1

CMD ["node", "dist/server.js"]
