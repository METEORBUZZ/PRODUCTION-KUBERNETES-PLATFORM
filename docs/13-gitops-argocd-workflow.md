# GitOps Delivery & Argo CD Architecture

GitOps establishes the Git repository as the **single, immutable source of truth** for all Kubernetes workloads. No human or CI pipeline directly executes `kubectl apply` against production.

---

## 1. End-to-End GitOps Workflow

```text
[ Developer ]
     │
     ▼ (git push)
[ GitHub Repository ] ────► Pull Request Triggered
                                │
                                ▼
                       [ GitHub Actions CI ]
                         • npm test & tsc lint
                         • Trivy container scan
                         • Docker build & push to Amazon ECR
                         • Auto-commit updated image tag to Helm values.yaml
                                │
                                ▼
                       [ Git Repository Updated ]
                                │
                                ▼ (Continuous 3-minute poll or Webhook)
                       [ Argo CD Controller in EKS ]
                         • Detects revision difference (Git vs Cluster)
                         • Reconciles manifest changes
                         • Executes progressive canary/rolling update
                         • Verifies pod readiness probes
                                │
                                ▼
                       [ Running EKS Cluster (Synchronized) ]
```

---

## 2. Automated Drift Detection & Self-Healing

If an engineer executes an unauthorized manual change:
```bash
# Example: Unauthorized manual scale-down
kubectl scale deployment/catdog-backend --replicas=1 -n catdog-platform
```

Argo CD immediately flags the application status as `OutOfSync`. Because `selfHeal: true` is configured in `argocd/application.yaml`, Argo CD automatically reconciles the cluster back to the Git-defined desired state (3 replicas) within seconds, logging the reconciliation event.

---

## 3. Instant Rollback Demonstration

If a bad deployment passes tests but exhibits runtime defects:
1. Revert the Git commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. Argo CD detects the reverted commit and restores the previous image and configuration automatically.
3. Alternatively, trigger an immediate emergency rollback in the Argo CD UI or CLI:
   ```bash
   argocd app rollback cat-dog-voting-production
   ```
