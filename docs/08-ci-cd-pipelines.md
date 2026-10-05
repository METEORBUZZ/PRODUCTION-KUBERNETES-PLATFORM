# CI/CD Pipelines & Release Engineering

The platform implements automated Continuous Integration (CI) and Continuous Deployment (CD) workflows powered by GitHub Actions.

---

## 1. Pull Request Pipeline (`.github/workflows/ci.yml`)

Every pull request initiates a comprehensive validation gate:

```text
PR Created / Updated
       │
       ▼
1. Lint & Test
   ├── Backend npm test (Jest unit + concurrency tests)
   ├── Backend TypeScript compilation (tsc)
   ├── Frontend TypeScript validation (tsc --noEmit)
   └── Frontend production bundle build (Vite)
       │
       ▼
2. Docker Multi-Stage Build & Security Scan
   ├── Build backend container image
   ├── Build frontend container image
   └── Aquasecurity Trivy scan (HIGH/CRITICAL CVEs)
       │
       ▼
3. Infrastructure Validation
   ├── Kustomize build validation (base + production overlays)
   └── Terraform format & validate (terraform validate)
```

---

## 2. Production Deployment Pipeline (`.github/workflows/cd.yml`)

Merging code into the `main` branch triggers automated deployment:

```text
Merge to main
       │
       ▼
1. Authenticate with AWS via OIDC
   (Zero static credentials, uses AWS IAM Role-to-Assume)
       │
       ▼
2. Build & Push Images to Amazon ECR
   ├── catdog-backend:<git-sha>
   └── catdog-frontend:<git-sha>
       │
       ▼
3. Deploy to AWS EKS
   ├── Update image tags in Kustomize overlay
   └── Apply manifests with kubectl apply -k
       │
       ▼
4. Verify Rollout Status
   ├── kubectl rollout status deployment/catdog-backend --timeout=180s
   └── kubectl rollout status deployment/catdog-frontend --timeout=180s
       │
       ▼
5. Automated Post-Deployment Smoke Test
   └── Executes ./scripts/smoke-test.sh
```
