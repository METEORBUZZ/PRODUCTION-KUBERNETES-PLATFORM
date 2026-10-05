# 🚀 Production Kubernetes Platform on AWS

[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.31-326ce5.svg?logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![AWS EKS](https://img.shields.io/badge/AWS-EKS-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/eks/)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-844FBA.svg?logo=terraform&logoColor=white)](https://terraform.io)
[![Argo CD](https://img.shields.io/badge/GitOps-Argo%20CD-EF7B4D.svg?logo=argo&logoColor=white)](https://argoproj.github.io/cd/)
[![Kyverno](https://img.shields.io/badge/Policy-Kyverno-1E90FF.svg)](https://kyverno.io)
[![PostgreSQL](https://img.shields.io/badge/Amazon%20RDS-PostgreSQL%2016-336791.svg?logo=postgresql&logoColor=white)](https://aws.amazon.com/rds/)

An enterprise-grade, highly available, secure, observable, and automated **Production Kubernetes Platform on AWS**.

The application workload is a **3D Cat vs Dog voting application** used to demonstrate real-world cloud engineering practices:
- **Cloud Infrastructure**: AWS Multi-AZ VPC, Amazon EKS v1.31, Amazon ECR, Amazon RDS PostgreSQL, Route 53, ACM, and AWS Secrets Manager.
- **Infrastructure as Code**: Modular Terraform (`modules/vpc`, `modules/eks`, `modules/rds`, `modules/iam`, `modules/ecr`) with remote state locking.
- **GitOps Continuous Delivery**: Argo CD continuous synchronization, automatic drift correction, and self-healing.
- **DevSecOps & Policy Enforcement**: Non-root containers, read-only root filesystems, Aquasecurity Trivy image scanning, and Kyverno admission policies.
- **Observability**: Prometheus metrics scraping, custom voting counters, Grafana dashboards, and Amazon CloudWatch log retention.
- **Reliability & Resilience**: Triple probe strategy, Pod Anti-Affinity, PDB (`minAvailable: 2`), HPA autoscaling (3–10 pods), and Multi-AZ RDS failover.

> 📖 **Beginner AWS & EKS Runbook**: Looking for a step-by-step CLI deployment guide? Check out [COMMANDS.md](COMMANDS.md) for copy-paste commands from `terraform apply` to live URL access.

---

## 1. Core Principle — No Overengineering

Every single technology in this platform has a documented architectural justification:

```text
Tool:                     Purpose:
Docker                    Containerization & immutable runtimes
Amazon ECR                Secure, immutable OCI container registry
Terraform                 Declarative Infrastructure as Code (IaC)
Amazon EKS                Multi-AZ managed Kubernetes control plane
Helm                      Modular Kubernetes package management
Jenkins                   Continuous Integration (CI) and Trivy security scanning
Argo CD                   Declarative GitOps Continuous Delivery (CD)
AWS ALB Controller        Native AWS Ingress integration with ACM TLS 1.3
Amazon RDS PostgreSQL     Multi-AZ relational persistence (ACID safe)
AWS Secrets Manager       Enterprise secrets vault with KMS encryption
External Secrets Operator Synchronizes AWS Secrets to Kubernetes via IRSA
Kyverno                   Kubernetes-native policy enforcement (Non-root, PSS)
Prometheus & Grafana      Metrics collection & SRE visualization
Amazon CloudWatch         Centralized platform and container audit logging
```

> **Strictly Avoided**: GitHub Actions, GitLab CI, Ansible, Istio, Kafka, Redis, Elasticsearch/Logstash/Kibana, Loki, Jaeger, Rancher, and artificial microservices.

*See the complete [Mandatory Tool Justification Matrix](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/00-tool-justification-matrix.md).*

---

## 2. High-Level Target Architecture

```text
                    Internet
                       │
                       ▼
                Route 53 / DNS
                       │
                       ▼
                 ACM / HTTPS (TLS 1.3)
                       │
                       ▼
              AWS Load Balancer (ALB)
                       │ (Target-Type: IP)
                       ▼
             ┌─────────────────────────┐
             │       Amazon EKS        │
             │   Multi-AZ (Private)    │
             └─────────┬───────────────┘
                       │
                Kubernetes Service (ClusterIP)
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
           Backend  Backend  Backend (3 Replicas Minimum)
              │        │        │
              └────────┼────────┘
                       │ (Private DB Subnets: Port 5432)
                       ▼
            Amazon RDS PostgreSQL (Multi-AZ)


Supporting Cloud & DevOps Automation:

Terraform (IaC)
    ├── modules/vpc
    ├── modules/eks
    ├── modules/rds
    ├── modules/iam
    └── modules/ecr

Jenkins (CI)
    └── Lint → Unit Tests → Trivy Scan → Docker Build → Push ECR

Argo CD (GitOps CD)
    └── Continuous Git-to-Cluster Sync → Automated Drift Correction

Security & Governance:
    ├── Kyverno (Disallow Root, Privileged, HostPath)
    ├── External Secrets Operator (AWS Secrets Manager sync via IRSA)
    └── Pod Security Standards (restricted)

Observability:
    ├── Prometheus → Metrics Collection (/metrics)
    ├── Grafana → SRE Dashboards
    └── Amazon CloudWatch → Container & Audit Logs
```

---

## 3. Repository Structure

```text
production-kubernetes-platform/
│
├── frontend/                     # React 18, Vite, Three.js, R3F, Tailwind CSS
├── backend/                      # Node.js 22, Express, TypeScript, prom-client
├── database/
│   └── init.sql                  # PostgreSQL schema, UNIQUE constraints & triggers
│
├── docker/
│   ├── Dockerfile.backend        # Multi-stage production backend image (UID 10001)
│   ├── Dockerfile.frontend       # Multi-stage unprivileged Nginx frontend image (UID 101)
│   └── nginx/default.conf        # Security headers, gzip, and API reverse proxy
│
├── terraform/                    # Modular Infrastructure as Code
│   ├── modules/
│   │   ├── vpc/                  # Multi-AZ VPC with 3 public, 3 private app, 3 private db subnets
│   │   ├── eks/                  # EKS cluster v1.31, KMS encryption, managed node groups
│   │   ├── rds/                  # Multi-AZ RDS PostgreSQL with AWS Secrets Manager
│   │   ├── iam/                  # EKS roles, node roles, ALB controller IRSA, ESO IRSA
│   │   └── ecr/                  # Repositories with scan-on-push and lifecycle rules
│   └── environments/
│       └── production/           # Root environment composition with S3 state backend
│
├── helm/
│   └── cat-dog-voting/           # Modular production Helm chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/            # Deployment, Service, Ingress, HPA, PDB, NetworkPolicy
│
├── argocd/                       # GitOps specifications
│   ├── application.yaml          # Argo CD Application (automated sync, prune, self-heal)
│   ├── appproject.yaml           # Argo CD AppProject with destination boundaries
│   └── install.yaml              # Argo CD bootstrap guide
│
├── security/
│   ├── kyverno/                  # Admission policies (require-non-root, drop-caps, limits)
│   └── external-secrets/         # AWS Secrets Manager SecretStore & ExternalSecret
│
├── monitoring/
│   ├── prometheus/               # Prometheus scraping config & SRE alert rules
│   └── grafana/                  # Provisioning & JSON dashboards for voting telemetry
│
├── scripts/
│   ├── load-test.js              # Concurrency load test (verifies 0 lost votes)
│   ├── load-test.sh              # Load test wrapper
│   ├── smoke-test.sh             # Health, readiness, and API validation
│   └── failure-test.sh           # Resilience suite (pod kill, rolling update, rollback)
│
├── docs/                         # Comprehensive 18-part engineering documentation
├── docker-compose.yml            # Local simulation stack
├── Makefile                      # Standardized developer workflows
├── README.md                     # Master documentation
└── .gitignore
```

---

## 4. Local Quickstart & Testing

```bash
# 1. Start full multi-container stack locally via Docker Compose
make dev

# 2. Run automated test suites
make test         # Backend unit tests & frontend type checks
make load-test    # Concurrency test (verifies atomic updates & 0 lost votes)
make k8s-validate # Validates Kubernetes manifests against API schemas

# 3. Access local endpoints
# Application UI:        http://localhost:3002
# Backend API:           http://localhost:8080/api/votes
# Prometheus Console:    http://localhost:9090
# Grafana Dashboards:    http://localhost:3001 (admin / admin)
```

---

## 5. Comprehensive Documentation Library

All platform specifications, runbooks, and design decisions are cataloged in [`docs/`](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs):

1. **[Tool Justification Matrix](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/00-tool-justification-matrix.md)**: Mandatory justification for EVERY tool in the stack.
2. **[AWS Cloud Architecture](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/12-aws-cloud-architecture.md)**: VPC, Subnet design, CIDR routing, and network flow.
3. **[GitOps Delivery with Argo CD](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/13-gitops-argocd-workflow.md)**: Git-as-source-of-truth, drift detection, and automated rollback.
4. **[Security, DevSecOps & Kyverno](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/14-security-and-devsecops.md)**: Trivy scanning, Kyverno policies, and AWS Secrets Manager integration.
5. **[Node Autoscaling: Karpenter vs MNG](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/15-node-autoscaling-karpenter.md)**: Dynamic node provisioning and consolidation analysis.
6. **[FinOps & Cost Modeling](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/16-finops-and-cost-control.md)**: Detailed AWS monthly cost breakdown (~$304/month) and optimization tactics.
7. **[Disaster Recovery & Business Continuity](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/17-disaster-recovery-and-backup.md)**: RTO (< 15 mins), RPO (< 5 mins), Multi-AZ failover, and RDS restore runbook.
8. **[Production Readiness Checklist](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/18-production-readiness-checklist.md)**: Complete compliance checklist across all operational domains.
9. **[Junior Engineer Onboarding Handbook](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/11-junior-engineer-handbook.md)**: Tool-by-tool setup and troubleshooting guide.
10. **[Testing, Load Generation & Failure Suite](file:///Users/apple/Downloads/Production%20Kubernetes%20Platform/docs/10-testing-and-resilience.md)**: Pod failure injection, rolling updates, and verification.
