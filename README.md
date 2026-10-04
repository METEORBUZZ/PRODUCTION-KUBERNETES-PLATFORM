# Production Kubernetes Platform — 3D Cat vs Dog Voting Application

[![CI Pipeline](https://github.com/production-kubernetes-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/production-kubernetes-platform/actions)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.31-326ce5.svg?logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![AWS EKS](https://img.shields.io/badge/AWS-EKS-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/eks/)
[![React Three Fiber](https://img.shields.io/badge/Three.js-R3F-000000.svg?logo=three.js&logoColor=white)](https://threejs.org)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C.svg?logo=prometheus&logoColor=white)](https://prometheus.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://postgresql.org)

An enterprise-grade, high-availability Kubernetes platform running a **cinematic 3D Cat vs Dog voting application**.

> **Core Purpose**: Users vote for either **CAT 🐱** or **DOG 🐶** and see real-time voting consensus powered by an ACID-compliant PostgreSQL database, auto-scaling Kubernetes microservices, zero-trust network policies, and full-stack Prometheus observability.

---

## 1. Visual Experience & Character Showcase

```text
        CAT 🐱                 VS                 DOG 🐶

    [ 3D Living Cat ]                     [ 3D Living Dog ]
      Warm Ginger Fur                       Warm Caramel Fur
      Natural Breathing                     Wagging Bushy Tail
      Studio Pedestal                       Studio Pedestal

     [ VOTE FOR CAT ]                      [ VOTE FOR DOG ]

                        CURRENT LEADER
                     🐱 CAT LEADING (52%)

    CAT 52%  [ ● ● ● ● ● ● ● ● ● ●   ● ● ● ● ● ● ● ● ● ]  48% DOG
                   Total Consensus: 10,245
```

- **Cinematic 3D Character Arena**: Three.js + React Three Fiber studio environment with soft directional key lighting, rim highlights, subtle floating ambient motes, and realistic contact shadows.
- **Dynamic Camera Parallax**: Smooth cursor tracking that gently pans and tilts the camera while characters track user gaze.
- **Micro-Interactions**: Tactile mechanical voting buttons with celebratory character animations, atomic vote counter increments, and dynamic dot-matrix arena balance visualization.
- **Restrained Palette**: Sophisticated neutral charcoal studio backdrop (`#141312`) allowing the warm, natural fur tones of the characters to provide visual personality without garish neon gradients or generic dashboard templates.

---

## 2. Platform Architecture

```text
[ Internet User / Mobile / Desktop ]
                │
                ▼ (HTTPS :443)
       [ AWS Route 53 DNS ]
                │
                ▼
   [ AWS Application Load Balancer ]
                │
                ▼ (Target Group: Pod IPs)
   [ Kubernetes Ingress (AWS Load Balancer Controller) ]
                │
        ┌───────┴───────────────────────┐
        ▼ (Path: /)                     ▼ (Path: /api, /health, /metrics)
[ Frontend Service: 8080 ]      [ Backend Service: 8080 ]
        │ (ClusterIP)                   │ (ClusterIP)
        ▼                               ▼
[ Frontend Pods (3 Replicas) ]  [ Backend Pods (3 Replicas) ]
  • React 18 + Three.js           • Node.js 22 + TypeScript
  • Unprivileged Nginx            • prom-client Telemetry
  • Read-Only Root Filesystem     • Atomic SQL Transactions
                                        │
                                        ▼ (Port: 5432)
                        [ PostgreSQL Database Service ]
                          • AWS RDS Multi-AZ / StatefulSet
                          • ACID Atomic Counter Increments
                          • Check Constraint (count >= 0)
```

---

## 3. Production Kubernetes Features

- **High Availability**: Minimum 3 replicas per service with Pod Anti-Affinity spreading replicas across distinct physical worker nodes (`kubernetes.io/hostname`).
- **Zero-Downtime Upgrades**: `RollingUpdate` with `maxSurge: 1`, `maxUnavailable: 0` ensuring zero dropped requests during new releases.
- **Pod Disruption Budget (PDB)**: `minAvailable: 2` guarantees service availability during node drains and cluster upgrades.
- **Autoscaling (HPA)**: Automatically scales between 3 and 10 replicas based on 70% CPU and 80% Memory utilization thresholds.
- **Zero-Trust Security**:
  - `restricted` Pod Security Standards enforced on namespace.
  - Non-root containers (Backend UID `10001`, Frontend UID `101`).
  - Read-only root filesystems with `ALL` Linux capabilities dropped.
  - Zero-trust `NetworkPolicy` isolating frontend, backend, database, and ingress.
- **Triple Health Probes**: `startupProbe`, `readinessProbe` (verifies DB `SELECT 1`), and `livenessProbe` on all deployments.

---

## 4. Quickstart Guide

### Prerequisites
- Node.js 22+ & npm
- Docker Desktop or Docker Engine
- `kubectl` & `terraform` (for cloud deployments)

### 1. Run Locally with Docker Compose
```bash
# Starts Postgres, Backend, Frontend, Prometheus, and Grafana
make dev
```
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api/votes](http://localhost:8080/api/votes)
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **Prometheus Metrics**: [http://localhost:8080/metrics](http://localhost:8080/metrics)
- **Prometheus Dashboard**: [http://localhost:9090](http://localhost:9090)
- **Grafana Visualization**: [http://localhost:3001](http://localhost:3001) (User: `admin` / Password: `admin`)

### 2. Run Tests & Validation
```bash
make test          # Run backend unit/integration tests & frontend lint
make build         # Compile production distribution bundles
make k8s-validate  # Validate Kubernetes base & production overlay manifests
make load-test     # Run concurrency load test verifying zero lost votes
```

---

## 5. Developer Commands Reference (`Makefile`)

| Command | Action |
| :--- | :--- |
| `make install` | Installs dependencies for backend and frontend. |
| `make dev` | Launches full multi-container development environment via Docker Compose. |
| `make test` | Executes Jest test suites and TypeScript type checking. |
| `make build` | Compiles production assets for backend (Node.js) and frontend (Vite). |
| `make docker-build` | Builds multi-stage production Docker images with immutable Git SHA tags. |
| `make docker-scan` | Runs Aquasecurity Trivy vulnerability scanning on built container images. |
| `make k8s-validate` | Validates Kubernetes Kustomize manifests against API schemas. |
| `make deploy` | Deploys Kustomize production overlay to Kubernetes and waits for rollout. |
| `make status` | Queries pods, services, HPA, PDB, and ingress in namespace `catdog-platform`. |
| `make logs` | Streams live logs from backend pods. |
| `make load-test` | Executes concurrent voting load test and verifies 100% data consistency. |
| `make rollback` | Reverts deployment to previous stable revision with zero downtime. |

---

## 6. Comprehensive Documentation Library

Detailed engineering documentation is organized inside [`docs/`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs):

- [`01-architecture.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/01-architecture.md): System architecture, network flow, and security posture.
- [`02-3d-ui-ux.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/02-3d-ui-ux.md): 3D character showcase, Three.js shaders, lighting, and camera parallax.
- [`03-backend-api.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/03-backend-api.md): REST API endpoints, concurrency handling, and Prometheus metrics.
- [`04-database-design.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/04-database-design.md): PostgreSQL relational schema, atomic updates, and RDS Multi-AZ.
- [`05-docker-containers.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/05-docker-containers.md): Multi-stage builds, non-root users, and container hardening.
- [`06-kubernetes-platform.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/06-kubernetes-platform.md): Deployments, HPA, PDB, NetworkPolicies, and Pod Security Standards.
- [`07-terraform-aws-eks.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/07-terraform-aws-eks.md): AWS VPC, EKS v1.31, Managed Node Groups, ECR, IAM, and RDS.
- [`08-ci-cd-pipelines.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/08-ci-cd-pipelines.md): GitHub Actions pull request and production release pipelines.
- [`09-observability-monitoring.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/09-observability-monitoring.md): Prometheus scrape configs, Grafana dashboards, and alerting rules.
- [`10-testing-and-resilience.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/10-testing-and-resilience.md): Concurrency testing, pod failure simulation, and rolling rollbacks.
- [`11-junior-engineer-handbook.md`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/11-junior-engineer-handbook.md): Complete setup guide (What/Why/Install/Config/Troubleshooting) for all tools.
