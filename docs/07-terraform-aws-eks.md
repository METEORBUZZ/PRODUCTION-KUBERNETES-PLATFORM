# AWS Infrastructure & Terraform Architecture

The infrastructure as code (IaC) in `terraform/` provisions an enterprise AWS topology designed according to AWS Well-Architected Framework guidelines.

---

## 1. AWS Architecture Components

1. **VPC Networking (`vpc.tf`)**:
   - 3 Public Subnets (`10.0.0.0/20`, `10.0.16.0/20`, `10.0.32.0/20`) across 3 Availability Zones.
   - 3 Private Subnets (`10.0.64.0/20`, `10.0.80.0/20`, `10.0.96.0/20`) hosting worker nodes and databases.
   - NAT Gateway providing secure outbound internet access for private workloads.
   - Subnet tags for AWS Load Balancer Controller discovery (`kubernetes.io/role/elb` and `kubernetes.io/role/internal-elb`).

2. **AWS EKS Control Plane (`eks.tf`)**:
   - Kubernetes version 1.31.
   - Multi-AZ control plane managed by AWS.
   - Control plane logging enabled: `api`, `audit`, `authenticator`, `controllerManager`, `scheduler`.
   - Private and public endpoint access enabled with security group restriction.

3. **EKS Managed Node Groups (`node_groups.tf`)**:
   - Instance types: `t3.medium`, `t3a.medium`.
   - Node count: 3 minimum, 10 maximum, 3 desired.
   - Deployed exclusively in private subnets.
   - Automated rolling updates with `max_unavailable = 1`.

4. **Amazon ECR Repositories (`ecr.tf`)**:
   - `catdog-backend` and `catdog-frontend`.
   - Tag immutability enabled (`IMMUTABLE`).
   - Automated vulnerability scanning on image push.
   - Lifecycle policy expiring untagged images older than 30 days.

5. **Amazon RDS PostgreSQL (`rds.tf`)**:
   - Engine: PostgreSQL 16.
   - Multi-AZ synchronous replication for automated failover.
   - Storage: 20 GB gp3 with autoscaling up to 100 GB.
   - Inbound security group allows connections strictly from the EKS worker nodes security group.

6. **IAM & IRSA (`iam.tf`)**:
   - OpenID Connect (OIDC) identity provider.
   - IAM Roles for Service Accounts (IRSA) allowing fine-grained AWS IAM permissions for Kubernetes pods without embedding credentials.

---

## 2. Step-by-Step Provisioning Guide

```bash
# 1. Initialize Terraform providers and state backend
cd terraform
terraform init

# 2. Review execution plan
terraform plan -var-file=terraform.tfvars.example

# 3. Apply infrastructure changes
terraform apply -var-file=terraform.tfvars.example -auto-approve

# 4. Connect kubectl to the new EKS cluster
aws eks update-kubeconfig --region us-east-1 --name catdog-platform-cluster

# 5. Verify nodes
kubectl get nodes -o wide
```
