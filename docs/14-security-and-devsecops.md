# Security, DevSecOps & Policy Enforcement

Security is embedded into every lifecycle phase—from developer IDE to container builds, admission webhooks, and cloud infrastructure.

---

## 1. DevSecOps Defense-in-Depth Model

| Layer | Security Controls | Implementation Tool |
| :--- | :--- | :--- |
| **Source Code** | Static analysis, TypeScript strict mode, zero committed secrets | ESLint, Git pre-commit hooks, `.gitignore` |
| **Container Images** | Multi-stage builds, non-root users (UID 10001/101), CVE scanning | Docker, Aquasecurity Trivy in CI |
| **Container Registry** | Tag immutability (`IMMUTABLE`), automated scan-on-push | Amazon ECR |
| **Admission Control** | Pod Security Standards (`restricted`), declarative policy enforcement | Kubernetes PSA + Kyverno ClusterPolicies |
| **Runtime & Pods** | Read-only root filesystem, dropped `ALL` capabilities, zero-trust network policies | Pod SecurityContext, Kubernetes NetworkPolicy |
| **Secrets** | Envelope encryption with KMS, external secret synchronization via IRSA | AWS Secrets Manager + External Secrets Operator |
| **Cloud IAM** | Least-privilege IAM policies, passwordless GitHub Actions OIDC auth | AWS IAM / IRSA |

---

## 2. Kyverno Policy Enforcement (`security/kyverno/`)

Five production policies are deployed to namespace `catdog-platform`:

1. **`require-non-root-user`**: Blocks any container where `runAsNonRoot` is false or unset.
2. **`disallow-privileged-containers`**: Rejects any pod definition requesting `privileged: true`.
3. **`drop-all-capabilities`**: Enforces that all containers specify `capabilities.drop: ["ALL"]`.
4. **`disallow-host-path`**: Prevents containers from mounting dangerous host filesystem paths.
5. **`require-resource-limits-requests`**: Rejects workloads that omit CPU or Memory requests and limits to protect against noisy neighbors.

---

## 3. Secrets Lifecycle & AWS Secrets Manager Integration

```text
[ AWS Secrets Manager ]
  • Secret: catdog-platform/database-credentials
  • Encrypted with AWS KMS
  • Automated rotation capability
          │
          ▼ (IAM Role for Service Account - IRSA)
[ External Secrets Operator ]
  • SecretStore: aws-secrets-manager
  • ExternalSecret: catdog-db-credentials (refreshes hourly)
          │
          ▼ (In-Memory Kubernetes Secret)
[ Kubernetes Secret: catdog-db-secret ]
          │
          ▼ (Injected via envFrom / secretKeyRef)
[ Application Pods ]
  • DB_USER & DB_PASSWORD available as environment variables
  • Zero secrets stored in Git or Helm values!
```
