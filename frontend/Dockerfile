# ==========================================
# Stage 1: Build React Three.js Frontend
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

# ==========================================
# Stage 2: Minimal Non-Root Nginx Runtime
# ==========================================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
