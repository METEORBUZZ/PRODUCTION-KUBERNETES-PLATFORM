# FinOps, Cost Modeling & Cloud Economics

Production engineering requires deliberate cost control. Every architectural choice has been modeled to provide enterprise-grade reliability without unnecessary expenditure.

---

## 1. Monthly Cost Breakdown (Estimated AWS us-east-1)

| AWS Resource | Configuration | Unit Cost | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Amazon EKS Control Plane** | 1 Cluster | $0.10 / hour | **$73.00** |
| **EC2 Worker Nodes** | 3 x `t3.medium` (On-Demand / Savings Plan) | ~$0.0416 / hr per node | **$89.85** |
| **Amazon RDS PostgreSQL** | 1 x `db.t4g.medium` (Multi-AZ, 20GB gp3) | ~$0.104 / hour + storage | **$78.20** |
| **AWS NAT Gateway** | 1 NAT Gateway (Single Public Subnet) | $0.045 / hour + $0.045/GB | **$34.50** |
| **AWS Application Load Balancer** | 1 ALB (Multi-AZ target group) | $0.0225 / hr + LCU | **$18.50** |
| **Amazon ECR Storage** | 2 repos, ~15GB tagged images | $0.10 / GB | **$1.50** |
| **Amazon CloudWatch** | Control plane logs + container logs (14-day retention) | Ingestion + Storage | **$8.00** |
| **AWS Secrets Manager** | 1 Secret (`database-credentials`) | $0.40 / secret + API calls | **$0.45** |
| **Total Estimated Monthly Spend** | | | **~$304.00** |

---

## 2. Key Cost Optimization Strategies

1. **Graviton RDS Instances (`db.t4g.medium`)**:
   - ARM64-based AWS Graviton2 processors provide 20% better price-performance compared to comparable Intel x86 (`db.t3.medium`) instances.

2. **Single NAT Gateway Architecture**:
   - Rather than provisioning 3 NAT Gateways across all 3 AZs (costing ~$105/month in fixed idle fees), our VPC topology routes private application subnets through a single highly available NAT Gateway in public subnet 1, cutting NAT costs by 66%.

3. **CloudWatch Log Retention**:
   - Default CloudWatch log retention is "Never Expire", which inflates bills indefinitely. We configure a strict 14-day expiration policy for container stdout logs and 30 days for control plane audit logs.

4. **ECR Lifecycle Policies**:
   - Retaining untagged images wastes storage. An automated lifecycle policy prunes untagged images and keeps only the last 30 tagged production releases.

5. **Karpenter Consolidation & Spot Utilization**:
   - Karpenter consolidation policies terminate idle nodes and utilize Spot instances during scaling bursts, yielding an additional 30–50% savings on worker node compute.
