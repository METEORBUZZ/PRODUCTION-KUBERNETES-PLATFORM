# Docker Containers & Security Hardening

Both microservices leverage multi-stage Docker builds designed with non-root security contexts, minimal attack surfaces, and zero unnecessary development dependencies.

---

## 1. Multi-Stage Build Architecture

### Backend Container (`docker/Dockerfile.backend`)
1. **Builder Stage (`node:22-alpine`)**:
   - Copies `package.json` and runs `npm ci`.
   - Compiles TypeScript to optimized JavaScript (`dist/`).
   - Prunes devDependencies with `npm prune --production`.
2. **Runner Stage (`node:22-alpine`)**:
   - Creates a dedicated non-root user `appuser:appgroup` with UID `10001:10001`.
   - Copies only compiled JavaScript files and production `node_modules`.
   - Exposes port `8080`.
   - Implements native container `HEALTHCHECK` pointing to `/health`.
   - Drops all unnecessary binary utilities.

### Frontend Container (`docker/Dockerfile.frontend`)
1. **Builder Stage (`node:22-alpine`)**:
   - Compiles React 18, Three.js, and Tailwind CSS using Vite (`dist/`).
2. **Runner Stage (`nginxinc/nginx-unprivileged:1.27-alpine`)**:
   - Runs as non-root user `nginx` (UID 101).
   - Listens on unprivileged port `8080`.
   - Serves static assets with Gzip compression and security headers (`X-Frame-Options`, `X-Content-Type-Options`).
   - Reverse proxies `/api`, `/health`, `/ready`, and `/metrics` directly to the backend service.

---

## 2. Container Security Checklist

| Security Control | Implementation | Verification Command |
| :--- | :--- | :--- |
| **Non-Root Execution** | `USER 10001:10001` (Backend) / `101:101` (Frontend) | `docker run --rm <image> id` |
| **Read-Only Root Filesystem** | Ephemeral writes redirected to `/tmp` | `docker run --read-only ...` |
| **Dropped Linux Capabilities** | Dropped `ALL` capabilities in Pod spec | Verified in Kubernetes manifest |
| **Immutable Tagging** | Tags set to `git rev-parse --short HEAD` (e.g. `catdog:a1b2c3d`) | Disallows mutating `latest` |
| **Vulnerability Scanning** | Scanned with Aquasecurity Trivy in CI pipeline | `trivy image catdog-backend:1.0.0` |
