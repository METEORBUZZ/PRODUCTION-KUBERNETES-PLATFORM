# System Architecture & Infrastructure Design

The **Production Kubernetes Platform — 3D Cat vs Dog Voting Application** is designed to demonstrate enterprise-grade reliability, zero-downtime scalability, security hardening, and real-time observability using a cinematic 3D character showcase.

---

## 1. High-Level Flow

```
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

## 2. Component Breakdown

| Layer | Technology | High Availability Configuration | Security Controls |
| :--- | :--- | :--- | :--- |
| **Frontend** | React, Three.js, R3F, Nginx | 3 Replicas, HPA (3–10), Pod Anti-Affinity | Non-root UID 101, Read-only FS, Drop ALL capabilities |
| **Backend API** | Node.js 22, Express, TypeScript | 3 Replicas, HPA (3–10), Pod Anti-Affinity | Non-root UID 10001, Read-only FS, Drop ALL capabilities |
| **Database** | PostgreSQL 16 | Multi-AZ RDS / StatefulSet with PVC | Private subnet only, SG restricted to EKS worker nodes |
| **Ingress** | AWS ALB Controller | Multi-AZ Load Balancer | TLS termination, AWS Shield Standard, Target-Type: IP |
| **Telemetry** | Prometheus + Grafana | Pull-based scrape every 5s | Dedicated scrape ServiceAccount, least-privilege RBAC |

---

## 3. Network Architecture & Zero-Trust Policies

All pod-to-pod communications are governed by Kubernetes `NetworkPolicy` objects enforcing a default-deny posture:

1. **Default Deny**: All ingress and egress traffic within namespace `catdog-platform` is blocked by default.
2. **Frontend Isolation**: Frontend pods can only accept inbound HTTP traffic from the Ingress Controller and initiate egress strictly to Backend pods on port 8080 and DNS on port 53.
3. **Backend Isolation**: Backend pods accept traffic strictly from Frontend pods and the Ingress Controller on port 8080. Egress is strictly permitted to PostgreSQL on port 5432 and DNS on port 53.
4. **PostgreSQL Isolation**: PostgreSQL accepts inbound TCP traffic on port 5432 strictly from Backend pods.
