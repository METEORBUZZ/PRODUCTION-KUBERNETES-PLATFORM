# Node Autoscaling: Karpenter vs Managed Node Groups

This document analyzes node autoscaling strategies and details the production configuration for both **Amazon EKS Managed Node Groups** and **Karpenter**.

---

## 1. Architectural Comparison

| Dimension | EKS Managed Node Groups + Cluster Autoscaler | Karpenter |
| :--- | :--- | :--- |
| **Scaling Mechanism** | Scales AWS Auto Scaling Groups (ASGs) | Directly calls EC2 Fleet API without ASGs |
| **Instance Flexibility** | Constrained to instances predefined in ASG | Chooses dynamically from dozens of instance families |
| **Provisioning Speed** | 3 to 7 minutes (ASG lifecycle + node bootstrap) | 40 to 60 seconds (fast launch template + AL2023) |
| **Consolidation** | Limited (relies on kube-scheduler drain) | Native, intelligent consolidation (`WhenUnderutilized`) |
| **Spot Interruption** | Requires AWS Node Termination Handler | Native SQS event-driven interruption handling |
| **Complexity** | Low (managed entirely by AWS) | Medium (requires CRDs and IAM controllers) |

---

## 2. Why Karpenter is Justified for This Platform

1. **Mixed Architecture & Instant Rightsizing**: When voting traffic spikes trigger the Horizontal Pod Autoscaler (HPA) to scale from 3 to 10 replicas, Karpenter evaluates the pending pod CPU/memory requests and provisions the exact instance shape (e.g. `c6i.large` vs `t3.medium`) without waiting for static ASGs.
2. **Consolidation & Bin-Packing**: Once the traffic burst subsides, Karpenter consolidates remaining pods onto fewer instances and drains underutilized nodes, saving up to 40% on compute costs.
3. **Spot Instance Diversification**: Karpenter requests Spot instances across multiple availability zones and instance types, with automatic fallback to On-Demand if Spot capacity is unavailable.

---

## 3. Production Karpenter Specification (`kubernetes/base/karpenter-nodepool.yaml`)

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: general-compute
spec:
  template:
    spec:
      nodeClassRef:
        group: karpenter.k8s.aws
        kind: EC2NodeClass
        name: default
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values: ["amd64", "arm64"]
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["on-demand", "spot"]
        - key: karpenter.k8s.aws/instance-family
          operator: In
          values: ["t3", "m6i", "m6a", "c6i"]
      expireAfter: 720h # 30-day node replacement for security hygiene
  limits:
    cpu: "100"
    memory: 200Gi
  disruption:
    consolidationPolicy: WhenUnderutilized
    consolidateAfter: 1m
```

---

## 4. End-to-End Autoscaling Sequence

```text
1. Low Traffic (Baseline)
   ├── 3 Backend Replicas + 3 Frontend Replicas
   └── 3 x t3.medium EC2 Worker Nodes active across 3 AZs

2. Voting Traffic Spike
   ├── High request volume detected on /api/vote/cat and /api/vote/dog
   ├── Metrics scraped by Prometheus; CPU utilization climbs > 70%
   └── Kubernetes HPA triggers scale-up (3 -> 8 Pods)

3. Insufficient Node Capacity
   ├── 3 new pods enter 'Pending' status due to CPU limits
   └── Karpenter controller detects unschedulable pods immediately (< 1s)

4. Dynamic Node Provisioning
   ├── Karpenter provisions optimal EC2 instance via EC2 Fleet API
   ├── Node joins cluster, becomes Ready within 45 seconds
   └── Pending pods scheduled; traffic routed via Service endpoints

5. Traffic Subsides & Consolidation
   ├── CPU drops < 70%; HPA scales down pods after 300s stabilization window
   └── Karpenter consolidates remaining pods and terminates idle EC2 instances
```
