# CI/CD Pipelines & Release Engineering

Jenkins runs Continuous Integration (CI). Argo CD handles Continuous Deployment (CD) by reconciling the Kubernetes manifests in Git with the EKS cluster. No GitHub Actions workflows are used.

---

## 1. Continuous Integration with Jenkins

Jenkins validates changes and builds and scans the application images before publishing them to Amazon ECR:

```text
Code change
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
       │
       ▼
4. Build container images and block on HIGH/CRITICAL Trivy findings
       │
       ▼
5. On `main`, push unique images to Amazon ECR and commit their tags to
   `helm/cat-dog-voting/values.yaml`
```

---

## 2. Continuous Deployment with Argo CD

After Jenkins publishes images and updates their ECR repositories and tags in the Git-tracked Helm values, Argo CD detects the repository change and synchronizes the application to EKS. Jenkins does not deploy directly to Kubernetes.

```text
Updated Helm values committed to Git
       │
       ▼
[ Argo CD detects the Git revision ]
       │
       ▼
[ Argo CD synchronizes the Helm application to EKS ]
       │
       ▼
[ Kubernetes rolls out the new image versions ]
```
