# Runbook: Database Backups & Point-in-Time Restore

## 1. Backup Strategy & Cadence
- **Frequency**: Automated hourly snapshots + daily persistent dumps.
- **Retention**:
  - Hourly snapshots: Retained for 7 days.
  - Daily dumps: Retained for 30 days.
  - Monthly archive: Retained for 1 year in cold storage (AWS S3 Glacier / Cloudflare R2).
- **Encryption**: AES-256 server-side encryption with KMS customer-managed keys.

---

## 2. Testing Restore Without Touching Production
We maintain an automated restore validation script at `backend/scripts/restore_backup.py`.
It spins up an isolated sandbox database instance, imports the latest snapshot, executes relational integrity checks, verifies the SHA-256 Trust Ledger chain, and terminates the temporary instance.

### Manual Restore Procedure
1. **Locate Target Snapshot**:
   ```bash
   aws s3 ls s3://pactflow-backups/daily/ --human-readable
   ```
2. **Download Snapshot to Isolated Host**:
   ```bash
   aws s3 cp s3://pactflow-backups/daily/pactflow_dump_20261110.sql.gz ./restore_test/
   ```
3. **Decompress and Verify Checksum**:
   ```bash
   gzip -d ./restore_test/pactflow_dump_20261110.sql.gz
   sha256sum ./restore_test/pactflow_dump_20261110.sql
   ```
4. **Restore into Staging / Target Database**:
   ```bash
   psql -h staging-db.internal -U postgres -d pactflow_staging -f ./restore_test/pactflow_dump_20261110.sql
   ```
5. **Run Ledger Chain Verification**:
   ```bash
   python -m backend.scripts.restore_backup --verify-chain
   ```
6. **Switch DNS / Connection String** (if full disaster recovery failover is declared).
