# Kubernetes Production Platform Architecture

The Kubernetes layer provisions a hardened, highly available environment capable of automatic horizontal scaling, zero-downtime rolling upgrades, and fault domain tolerance.

---

## 1. High Availability Specifications

- **Replica Quorum**: Minimum 3 replicas per microservice running across multiple EC2 availability zones.
- **Pod Anti-Affinity**:
  ```yaml
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app
                  operator: In
                  values: ["catdog-backend"]
            topologyKey: "kubernetes.io/hostname"
  ```
  Prevents co-locating multiple replicas on the same node, ensuring node hardware failures do not disrupt service.

- **Pod Disruption Budget (PDB)**:
  `minAvailable: 2` guarantees that during Kubernetes node upgrades or cluster drains, at least 2 replicas are continuously active.

- **RollingUpdate Strategy**:
  ```yaml
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  ```
  Ensures zero dropped requests during software upgrades by launching new pods before terminating older versions.

---

## 2. Horizontal Pod Autoscaler (HPA)

```yaml
minReplicas: 3
maxReplicas: 10
metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

- When CPU utilization exceeds 70% or memory exceeds 80%, HPA automatically scales up to 10 pods.
- Scale-down stabilization window is configured to 300 seconds to prevent thrashing.

---

## 3. Triple Health Probe Strategy

| Probe | Path | Purpose | Timing |
| :--- | :--- | :--- | :--- |
| **startupProbe** | `/health` | Allows slow cold starts without tripping liveness kills | Initial: 3s, Period: 3s, Failures: 15 |
| **readinessProbe** | `/ready` | Verifies DB connectivity before routing traffic | Initial: 5s, Period: 5s, Failures: 3 |
| **livenessProbe** | `/health` | Detects deadlocks or crashed event loops and restarts pod | Initial: 10s, Period: 10s, Failures: 3 |

---

## 4. Pod Security Standards (Restricted)

Namespace `catdog-platform` enforces the official Kubernetes `restricted` Pod Security Standard:
- `runAsNonRoot: true`
- `allowPrivilegeEscalation: false`
- `readOnlyRootFilesystem: true`
- `capabilities.drop: ["ALL"]`
- `seccompProfile.type: RuntimeDefault`
