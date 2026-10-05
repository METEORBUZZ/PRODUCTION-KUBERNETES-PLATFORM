# Cat vs Dog Voting Platform Helm Chart

A production-ready Helm chart orchestrating the 3D Cat vs Dog voting application on Amazon EKS.

## Features
- Minimum 3 replicas with Pod Anti-Affinity across `kubernetes.io/hostname`
- Horizontal Pod Autoscaler (HPA) targeting 70% CPU and 80% Memory
- Pod Disruption Budget (PDB) guaranteeing `minAvailable: 2`
- AWS ALB Ingress with ACM TLS termination and HTTP->HTTPS redirection
- Zero-trust NetworkPolicy isolation
- Integration with AWS Secrets Manager via External Secrets Operator
- Non-root containers (UID 10001 backend, UID 101 frontend) with read-only root filesystems

## Installation
```bash
# Add or install locally
helm install cat-dog-voting ./helm/cat-dog-voting \
  --namespace catdog-platform \
  --create-namespace \
  -f ./helm/cat-dog-voting/values.yaml
```
