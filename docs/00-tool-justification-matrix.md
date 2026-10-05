# Mandatory Tool Justification Matrix

In strict accordance with the **No-Overengineering Principle**, every tool and service in the platform must provide measurable architectural value across reliability, security, scalability, deployment automation, or observability.

---

### 1. Docker
- **Purpose**: Containerize frontend and backend microservices into immutable container images.
- **Why we use it**: Guarantees bit-for-bit identical runtimes between local development, CI/CD security scanning, and production EKS.
- **Problem it solves**: Eliminates configuration drift, dependency version conflicts, and "it works on my machine" failures.
- **Alternative**: Raw VM deployments (systemd / AMIs) or buildpacks.
- **Why alternative was not selected**: AMIs take 5–15 minutes to bake and launch; Docker containers start in under 2 seconds and enable high pod density per EC2 node.
- **Operational impact**: Standardized build, test, and run interfaces (`docker build`, `docker run`).
- **Cost impact**: Zero licensing cost (open-source engine).

---

### 2. Amazon ECR (Elastic Container Registry)
- **Purpose**: Fully managed, encrypted OCI-compliant container registry hosted inside AWS.
- **Why we use it**: Native IAM authentication with EKS, tag immutability, and automated vulnerability scanning on push.
- **Problem it solves**: Prevents unauthorized image tampering, eliminates Docker Hub pull-rate limits, and keeps image pulls inside private AWS VPC endpoints.
- **Alternative**: Self-hosted Harbor or public Docker Hub.
- **Why alternative was not selected**: Harbor requires managing dedicated VMs, PostgreSQL, and storage; Docker Hub imposes rate limits and introduces external egress latency.
- **Operational impact**: Zero maintenance overhead; automated lifecycle policies prune old images.
- **Cost impact**: ~$0.10 per GB/month for storage; zero data transfer costs to EKS within the same region.

---

### 3. Terraform
- **Purpose**: Declarative Infrastructure as Code (IaC) tool for provisioning all AWS cloud resources.
- **Why we use it**: Provides state locking via DynamoDB, reproducible multi-AZ infrastructure, modularity, and peer review through Git.
- **Problem it solves**: Prevents manual console configuration errors, un-audited drift, and undocumented infrastructure dependencies.
- **Alternative**: AWS CloudFormation, AWS CDK, or Pulumi.
- **Why alternative was not selected**: Terraform is the global industry standard, vendor-agnostic, has superior ecosystem module maturity, and produces explicit, reviewable execution plans (`terraform plan`).
- **Operational impact**: All infrastructure changes require Git pull requests and automated `terraform plan` reviews.
- **Cost impact**: Zero tooling cost (open-source CLI).

---

### 4. Amazon EKS (Elastic Kubernetes Service)
- **Purpose**: Highly available, certified Kubernetes control plane managed by AWS.
- **Why we use it**: Automates control plane patching, multi-AZ etcd replication, cluster scaling, and native IAM integration.
- **Problem it solves**: Running self-hosted Kubernetes (kOps / kubeadm) requires managing 3–5 etcd master nodes, complex backup scripts, and manual disaster recovery.
- **Alternative**: Self-hosted Kubernetes on EC2 or AWS ECS.
- **Why alternative was not selected**: Self-hosted k8s has excessive operational maintenance; AWS ECS lacks Kubernetes ecosystem standardization (Helm, Argo CD, Kyverno, Prometheus Operator).
- **Operational impact**: AWS guarantees 99.95% control plane SLA; platform engineers focus solely on worker nodes and application workloads.
- **Cost impact**: $0.10/hour ($73/month) flat cluster fee.

---

### 5. Helm
- **Purpose**: Package manager and templating engine for Kubernetes manifests.
- **Why we use it**: Parameterizes deployments, manages environment-specific values, and standardizes atomic rollouts and rollbacks.
- **Problem it solves**: Raw Kubernetes YAML files lead to duplicated configurations across staging and production, increasing copy-paste human error.
- **Alternative**: Kustomize or plain YAML manifests.
- **Why alternative was not selected**: Kustomize is good for simple overlays but lacks dynamic template expressions, loops, and standardized package versioning (`Chart.yaml`).
- **Operational impact**: Single command releases (`helm upgrade --install`) and rollbacks (`helm rollback`).
- **Cost impact**: Zero cost (open-source CLI).

---

### 6. Jenkins
- **Purpose**: Continuous Integration (CI) automation platform.
- **Why we use it**: Runs the project's test, lint, build, infrastructure-validation, and image-scanning steps in a centrally managed pipeline.
- **Problem it solves**: Provides repeatable validation and image publishing before changes are promoted for deployment.
- **Alternative**: GitHub Actions, GitLab CI, CircleCI.
- **Operational impact**: Jenkins requires a maintained controller and build agents; pipeline configuration and credentials should be managed securely.
- **Cost impact**: Jenkins is open source; infrastructure and agent capacity incur operating costs.

---

### 7. Argo CD
- **Purpose**: Declarative GitOps continuous delivery tool for Kubernetes.
- **Why we use it**: Keeps the EKS cluster in continuous synchronization with the Git repository, detecting manual cluster drift and providing automated rollbacks.
- **Problem it solves**: Prevents "snowflake" clusters caused by ad-hoc `kubectl apply` commands; Git is the single source of truth.
- **Alternative**: Direct push deployment from CI (e.g. running `kubectl apply` inside Jenkins).
- **Why alternative was not selected**: CI push deployments require granting the CI system access to the Kubernetes API and cannot continuously detect or reconcile out-of-band cluster drift.
- **Operational impact**: Automated sync, self-healing, visual deployment status, and instant revision rollback.
- **Cost impact**: Minimal footprint (runs inside EKS cluster consuming ~0.2 CPU and 256MB RAM).

---

### 8. AWS Load Balancer Controller
- **Purpose**: Kubernetes controller that provisions and manages AWS Application Load Balancers (ALBs) based on Ingress resources.
- **Why we use it**: Native AWS integration, direct pod IP routing (Target-Type: IP), ACM TLS termination, and AWS WAF integration.
- **Problem it solves**: Traditional NodePort/Classic Load Balancers double-hop network packets across nodes, increasing latency and losing client source IPs.
- **Alternative**: Ingress-NGINX with Network Load Balancer (NLB).
- **Why alternative was not selected**: Deploying Ingress-NGINX adds an extra reverse-proxy layer inside the cluster; AWS ALB Controller leverages AWS managed infrastructure directly.
- **Operational impact**: Ingress manifests automatically create enterprise AWS ALBs with health checks.
- **Cost impact**: Standard AWS ALB pricing (~$16–$22/month + LCU usage).

---

### 9. Amazon RDS PostgreSQL
- **Purpose**: Fully managed relational database with automated backups, Multi-AZ failover, and storage encryption.
- **Why we use it**: Guarantees ACID transactional atomicity for the voting counter without running stateful databases inside Kubernetes.
- **Problem it solves**: Running stateful databases in Kubernetes adds operational complexity around EBS CSI attachments, failover quorum, and backup testing.
- **Alternative**: In-cluster PostgreSQL StatefulSet or Amazon DynamoDB.
- **Why alternative was not selected**: StatefulSet in k8s risks split-brain during node network partitions; DynamoDB lacks relational ACID transactions with standard SQL constraints.
- **Operational impact**: AWS handles automated snapshots, OS security patches, and sub-60-second Multi-AZ failover.
- **Cost impact**: `db.t4g.medium` Multi-AZ (~$73/month).

---

### 10. AWS Secrets Manager & External Secrets Operator (ESO)
- **Purpose**: Centralized enterprise secrets vault synchronized securely into Kubernetes Secrets via IAM Roles for Service Accounts (IRSA).
- **Why we use it**: Completely eliminates plaintext passwords and tokens from Git, Docker images, and Helm charts.
- **Problem it solves**: Prevents secret leaks in Git history and enables automated database credential rotation without rebuilding application pods.
- **Alternative**: Sealed Secrets or HashiCorp Vault.
- **Why alternative was not selected**: HashiCorp Vault is heavy and expensive to operate; Sealed Secrets still commits encrypted blobs to Git. ESO + AWS Secrets Manager uses AWS native KMS and IAM.
- **Operational impact**: Seamless synchronization: updating a secret in AWS automatically refreshes the Kubernetes secret.
- **Cost impact**: $0.40 per secret/month + $0.05 per 10,000 API calls.

---

### 11. Kyverno
- **Purpose**: Kubernetes-native policy engine for security governance and compliance enforcement.
- **Why we use it**: Declarative policies written as standard Kubernetes YAML to enforce Pod Security Standards without writing complex Rego code.
- **Problem it solves**: Prevents developers from accidentally deploying privileged containers, running as root, mounting host paths, or omitting resource limits.
- **Alternative**: OPA/Gatekeeper.
- **Why alternative was not selected**: OPA requires learning and maintaining complex Rego language queries; Kyverno uses familiar Kubernetes YAML expressions.
- **Operational impact**: Real-time admission review blocking non-compliant manifests before admission.
- **Cost impact**: Minimal compute overhead (~0.1 CPU, 128MB RAM).

---

### 12. Prometheus & Grafana
- **Purpose**: Pull-based time-series metrics collection and visualization platform.
- **Why we use it**: Collects application-level voting rates, HTTP latency histograms, pod CPU/memory utilization, and HPA autoscaling telemetry.
- **Problem it solves**: Provides real-time visibility into application performance, allowing SREs to diagnose bottlenecks before they cause downtime.
- **Alternative**: Datadog or New Relic.
- **Why alternative was not selected**: Datadog/New Relic cost hundreds of dollars per host per month; Prometheus & Grafana are open-source, industry-standard, and zero licensing cost.
- **Operational impact**: Real-time alerting on p95 latency spikes and 5xx error anomalies.
- **Cost impact**: Runs on existing EKS node compute resources.

---

### 13. Amazon CloudWatch
- **Purpose**: Centralized log management and control plane audit monitoring.
- **Why we use it**: Collects EKS control plane logs (`api`, `audit`, `authenticator`) and container logs natively without external collectors.
- **Problem it solves**: Preserves container logs even after pods crash, restart, or are terminated by HPA scale-down events.
- **Alternative**: Elasticsearch/Logstash/Kibana (ELK) or Grafana Loki.
- **Why alternative was not selected**: ELK requires massive RAM (8–16GB minimum) and dedicated storage management; CloudWatch is serverless, fully managed, and retention-configurable.
- **Operational impact**: Centralized search and retention rules (configured to 14–30 days for cost control).
- **Cost impact**: $0.50 per GB ingested; $0.03 per GB/month stored.

---

### 14. Karpenter / EKS Managed Node Groups
- **Purpose**: Intelligent worker node provisioning and autoscaling.
- **Why we use it**: Automatically provisions right-sized EC2 instances based on pending pod requirements, consolidating underutilized nodes.
- **Problem it solves**: Traditional Cluster Autoscaler is slow (takes 3–5 minutes) and is constrained by pre-defined Auto Scaling Group instance types.
- **Alternative**: Fixed static EC2 nodes or AWS Fargate.
- **Why alternative was not selected**: Fixed nodes waste money during low-traffic periods; Fargate has slower cold-starts and higher per-CPU cost.
- **Operational impact**: Fast node provisioning (< 45 seconds) and automatic Spot instance consolidation.
- **Cost impact**: Lowers EC2 costs by up to 40% through Spot instances and bin-packing.
