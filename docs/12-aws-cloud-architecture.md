# AWS Cloud Architecture & Network Topology

The AWS infrastructure is architected according to the **AWS Well-Architected Framework**, balancing operational excellence, security, reliability, performance efficiency, and cost optimization.

---

## 1. Network Topology & VPC CIDR Subnet Strategy

```text
VPC CIDR: 10.0.0.0/16 (us-east-1)
│
├── Public Subnets (Routing -> Internet Gateway)
│   ├── us-east-1a: 10.0.0.0/20   (ALB Nodes & NAT Gateway)
│   ├── us-east-1b: 10.0.16.0/20  (ALB Nodes)
│   └── us-east-1c: 10.0.32.0/20  (ALB Nodes)
│
├── Private Application Subnets (Routing -> NAT Gateway for outbound egress)
│   ├── us-east-1a: 10.0.64.0/20  (EKS Worker Nodes / Pods)
│   ├── us-east-1b: 10.0.80.0/20  (EKS Worker Nodes / Pods)
│   └── us-east-1c: 10.0.96.0/20  (EKS Worker Nodes / Pods)
│
└── Private Database Subnets (STRICTLY ISOLATED, No Route to Internet or NAT)
    ├── us-east-1a: 10.0.128.0/20 (RDS PostgreSQL Primary)
    ├── us-east-1b: 10.0.144.0/20 (RDS PostgreSQL Standby)
    └── us-east-1c: 10.0.160.0/20 (RDS PostgreSQL Backup)
```

### Key Subnet Tags
- **Public Subnets**:
  - `kubernetes.io/role/elb = 1`: Allows AWS Load Balancer Controller to discover public subnets for internet-facing ALBs.
  - `kubernetes.io/cluster/catdog-platform-cluster = shared`.
- **Private Application Subnets**:
  - `kubernetes.io/role/internal-elb = 1`: Allows internal ALB discovery.
  - `karpenter.sh/discovery = catdog-platform-cluster`: Allows Karpenter to discover subnets for dynamic node launches.
- **Private Database Subnets**:
  - Tagged `Tier = database` with zero route table entries to the Internet Gateway or NAT Gateway.

---

## 2. Ingress & Egress Traffic Flows

### External Ingress Flow
1. Client resolves `voting.production.internal` via Route 53 DNS.
2. Route 53 aliases to the AWS Application Load Balancer (ALB).
3. ALB terminates HTTPS using AWS Certificate Manager (ACM) TLS 1.3 certificate.
4. HTTP (port 80) requests are automatically redirected to HTTPS (port 443).
5. ALB forwards traffic directly to EKS pod IPs (`Target-Type: IP`) across private subnets via the AWS VPC CNI.

### Internal Microservice Flow
1. Frontend Nginx reverse proxy routes API requests to `catdog-backend-service:8080`.
2. Backend pods validate requests and execute atomic updates against RDS PostgreSQL on port 5432.
3. PostgreSQL is placed in private database subnets; security group rules strictly allow TCP 5432 ingress only from the EKS Node Security Group.

### Outbound Egress Flow
- EKS worker nodes reach Amazon ECR, GitHub, and package registries via the single NAT Gateway in public subnet 1.
- Database subnets have NO egress route to the NAT Gateway or Internet Gateway.
