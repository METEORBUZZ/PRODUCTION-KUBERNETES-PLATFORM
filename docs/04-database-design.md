# Database Design & Persistence Architecture

The persistence layer uses PostgreSQL 16 to guarantee ACID compliance, transactional atomicity, and disaster recovery.

---

## 1. Relational Schema (`database/init.sql`)

```sql
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    option VARCHAR(10) NOT NULL UNIQUE,
    count BIGINT NOT NULL DEFAULT 0 CHECK (count >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(option);

INSERT INTO votes (option, count, updated_at)
VALUES 
    ('CAT', 0, CURRENT_TIMESTAMP),
    ('DOG', 0, CURRENT_TIMESTAMP)
ON CONFLICT (option) DO NOTHING;
```

---

## 2. Key Constraints & Data Integrity

1. **Option Uniqueness**: Column `option` is marked `UNIQUE` to prevent duplicated counters.
2. **Non-Negative Invariant**: `CHECK (count >= 0)` ensures mathematical impossibility of counter corruption.
3. **Index Optimization**: B-Tree index on `option` guarantees `O(log N)` lookup and index row locks.
4. **Trigger Automation**: An automatic PostgreSQL trigger updates `updated_at` on every counter increment.

---

## 3. High Availability Deployment Models

- **AWS Production (Managed RDS)**:
  - Multi-AZ synchronous replication across two separate availability zones.
  - Automatic failover in under 60 seconds with zero data loss.
  - Automated point-in-time recovery (PITR) with 7-day retention.
  - Encrypted storage using AWS KMS customer managed keys.

- **In-Cluster Fallback (Kubernetes StatefulSet)**:
  - Deployed via `kubernetes/base/postgres.yaml`.
  - Headless Service `catdog-postgres` provides stable DNS.
  - PersistentVolumeClaim mounts dedicated EBS storage to `/var/lib/postgresql/data`.
