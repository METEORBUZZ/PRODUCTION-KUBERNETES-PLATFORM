# Junior Engineer Onboarding & Tooling Handbook

Welcome to the **Production Kubernetes Platform** team! This handbook provides a zero-to-hero operational guide for every tool used across this project.

---

## 1. Docker & Containerization

### What is it?
Docker is an open-source platform that packages applications and their runtime dependencies into lightweight, standalone, and executable containers.

### Why are we using it?
Containers guarantee that our application runs identically across a developer's Mac/Linux laptop, CI/CD runners, and the production AWS EKS cluster, eliminating the "it works on my machine" problem.

### How to Install
- **macOS**: `brew install --cask docker` (or download Docker Desktop).
- **Linux (Ubuntu/Debian)**: `sudo apt install docker.io docker-compose-plugin`.
- **Windows**: Install Docker Desktop with WSL2 backend.

### Important Commands
```bash
docker build -t catdog-backend:1.0.0 -f docker/Dockerfile.backend .  # Build image
docker run -p 8080:8080 --env-file .env catdog-backend:1.0.0       # Run container
docker compose up -d                                               # Start multi-container stack
docker ps                                                          # List active containers
docker logs -f <container_id>                                      # Tail container logs
docker exec -it <container_id> /bin/sh                             # Open shell in container
```

### Common Errors & Troubleshooting
- **Error**: `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`.
  - **Fix**: Docker Desktop is not running. Launch Docker Desktop and wait for the whale icon to stabilize.
- **Error**: `port is already allocated: 8080`.
  - **Fix**: Another process is using port 8080. Run `lsof -i :8080` (macOS/Linux) and terminate the offending process with `kill -9 <PID>`.

---

## 2. Kubernetes (`kubectl`)

### What is it?
Kubernetes (K8s) is an open-source container orchestration system for automating containerized software deployment, scaling, self-healing, and networking. `kubectl` is the official command-line client for interacting with the Kubernetes control plane.

### Why are we using it?
Kubernetes manages our 3-replica quorum, automates zero-downtime rolling updates, reschedules failed containers instantly, and handles Horizontal Pod Autoscaling (HPA) during traffic spikes.

### How to Install
- **macOS**: `brew install kubectl`
- **Linux**: `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && sudo install kubectl /usr/local/bin/`
- **Verify**: `kubectl version --client`

### Important Commands
```bash
kubectl get pods -n catdog-platform              # List all pods in namespace
kubectl describe pod <pod_name> -n catdog-platform # Inspect events, probes, and errors
kubectl logs -f <pod_name> -n catdog-platform    # Stream pod output
kubectl apply -k kubernetes/overlays/production  # Deploy manifests using Kustomize
kubectl rollout status deployment/catdog-backend # Track rolling update progress
kubectl rollout undo deployment/catdog-backend   # Instant rollback to previous version
kubectl port-forward svc/catdog-backend 8080:8080 # Forward remote pod port to localhost
```

### Common Errors & Troubleshooting
- **Error**: `CrashLoopBackOff`.
  - **Fix**: The container started, threw an uncaught error, and exited. Run `kubectl logs <pod_name> --previous` to see why it crashed before restarting.
- **Error**: `ImagePullBackOff` or `ErrImagePull`.
  - **Fix**: Kubernetes cannot pull the Docker image. Check if the image tag exists, if the ECR registry URL is spelled correctly, and if the node has IAM permissions to read from ECR.

---

## 3. Terraform (Infrastructure as Code)

### What is it?
Terraform by HashiCorp is an Infrastructure as Code (IaC) tool that lets you define cloud and on-premises resources in declarative configuration files.

### Why are we using it?
Terraform provisions our entire AWS cloud estate (VPC, EKS cluster, worker node groups, ECR registries, RDS PostgreSQL database, and security groups) deterministically, auditable via Git, and fully reproducible.

### How to Install
- **macOS**: `brew tap hashicorp/tap && brew install hashicorp/tap/terraform`
- **Linux**: Install via HashiCorp official Linux repository.
- **Verify**: `terraform -v`

### Important Commands
```bash
terraform init             # Initialize providers and state backends
terraform fmt -check       # Check code formatting standards
terraform validate         # Check syntax and configuration logic
terraform plan             # Preview infrastructure changes
terraform apply            # Provision or modify cloud resources
terraform destroy          # Tear down infrastructure (CAUTION!)
```

### Common Errors & Troubleshooting
- **Error**: `Error acquiring the state lock`.
  - **Fix**: Another engineer or pipeline is currently running Terraform, or a previous run was interrupted. Verify no active deployments are executing, then run `terraform force-unlock <LOCK_ID>`.
- **Error**: `AccessDeniedException` when running AWS operations.
  - **Fix**: Your AWS credentials lack sufficient IAM permissions. Verify your current identity with `aws sts get-caller-identity`.

---

## 4. Node.js & npm

### What is it?
Node.js is an open-source, cross-platform JavaScript runtime environment. npm is the default package manager for Node.js.

### Why are we using it?
Node.js powers our high-throughput REST backend (Express + TypeScript) and compiles our React 18 / Three.js frontend.

### How to Install
- Recommended via `nvm` (Node Version Manager):
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  nvm install 22
  nvm use 22
  ```

### Important Commands
```bash
npm install                # Install package dependencies
npm run dev                # Start local development server
npm test                   # Run automated Jest unit tests
npm run build              # Compile TypeScript to production JavaScript
npm run lint               # Run TypeScript static type analysis
```

---

## 5. Helm (Kubernetes Package Manager)

### What is it?
Helm is the package manager for Kubernetes, using packaging formats called "charts".

### Why are we using it?
Helm allows parameterizing deployments across environments (Dev, Staging, Production) using a single template definition and environment-specific `values.yaml` files.

### Important Commands
```bash
helm lint helm/catdog-platform                   # Lint chart syntax
helm template my-release helm/catdog-platform    # Render templates locally without deploying
helm install catdog helm/catdog-platform -n catdog-platform  # Install release
helm upgrade catdog helm/catdog-platform -n catdog-platform  # Upgrade release
```
