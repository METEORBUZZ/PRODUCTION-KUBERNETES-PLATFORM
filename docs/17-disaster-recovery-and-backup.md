# Disaster Recovery, Business Continuity & Backup Strategy

This document outlines the Disaster Recovery (DR) and Business Continuity Plan (BCP) for the platform, establishing tested Recovery Point Objectives (RPO) and Recovery Time Objectives (RTO).

---

## 1. Recovery Objectives (RTO & RPO)

| Metric | Target | Technical Mechanism |
| :--- | :--- | :--- |
| **RPO (Recovery Point Objective)** | **< 5 minutes** | Synchronous Multi-AZ RDS replication + 5-minute automated transaction log shipping (PITR). |
| **RTO (Recovery Time Objective)** | **< 15 minutes** | Automated multi-AZ failover (< 60s for AZ failure); fully automated Terraform rebuild (< 15 mins for entire infrastructure). |

---

## 2. Failure Scenarios & Automated Mitigations

### Scenario A: Single Availability Zone Hardware Outage
- **Impact**: One third of worker nodes and the primary RDS instance in `us-east-1a` become unreachable.
- **Automated Mitigation**:
  1. AWS RDS detects primary instance failure and automatically promotes the Multi-AZ standby in `us-east-1b` within 60 seconds without changing DNS endpoints.
  2. Kubernetes Pod Anti-Affinity and PDB (`minAvailable: 2`) ensure 2 healthy replicas continue serving traffic from `us-east-1b` and `us-east-1c`.
  3. Karpenter/EKS automatically reschedules lost pods onto surviving availability zones.
  4. **User Impact**: 0 downtime.

### Scenario B: Accidental Namespace or Database Deletion
- **Impact**: Human operator deletes the `catdog-platform` namespace or drops the database.
- **Automated Mitigation**:
  1. **Namespace Recovery**: Argo CD detects the missing resources and automatically self-heals the cluster back to the Git state within 60 seconds (`selfHeal: true`).
  2. **Database Recovery**: Execute point-in-time restore from AWS RDS automated snapshots:
     ```bash
     aws rds restore-db-instance-to-point-in-time \
       --source-db-instance-identifier catdog-platform-postgres \
       --target-db-instance-identifier catdog-platform-postgres-recovered \
       --restore-time $(date -u -v -10M +"%Y-%m-%dT%H:%M:%SZ") \
       --db-subnet-group-name catdog-platform-db-subnet-group
     ```

### Scenario C: Total Infrastructure Recreation (Region Rebuild)
- **Impact**: Full cloud infrastructure needs to be redeployed from scratch.
- **Procedure**:
  ```bash
  # 1. Re-provision entire AWS cloud estate via Terraform
  cd terraform/environments/production
  terraform init
  terraform apply -auto-approve

  # 2. Bootstrap Argo CD
  kubectl apply -f ../../../argocd/install.yaml

  # 3. Apply GitOps root application
  kubectl apply -f ../../../argocd/appproject.yaml
  kubectl apply -f ../../../argocd/application.yaml

  # 4. Restore database snapshot
  aws rds restore-db-instance-from-db-snapshot ...
  ```
  **Total Elapsed Recovery Time**: ~12–15 minutes.
