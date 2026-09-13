# =============================================================================
# backend/utils/db_backup.py — Safe SQLite Online Backup & S3 Sync Utility
# =============================================================================
import os
import sys
import sqlite3
import logging
import shutil
from datetime import datetime, timezone

from config import DATABASE_PATH, PAPERS_BACKUP_DIR, PAPERS_BACKUP_S3_BUCKET

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


def backup_database(max_snapshots: int = 7) -> str:
    """
    Performs a live, transactionally-consistent SQLite backup.
    Guarantees no database corruption even during active write transactions.
    """
    if not os.path.exists(DATABASE_PATH):
        logger.warning("Database file not found at %s. Nothing to backup.", DATABASE_PATH)
        return ""

    os.makedirs(PAPERS_BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_filename = f"papers_backup_{timestamp}.db"
    backup_filepath = os.path.join(PAPERS_BACKUP_DIR, backup_filename)

    logger.info("Initiating SQLite online backup from %s to %s", DATABASE_PATH, backup_filepath)
    src_conn = sqlite3.connect(DATABASE_PATH)
    dest_conn = sqlite3.connect(backup_filepath)

    try:
        # Use SQLite Online Backup API
        with dest_conn:
            src_conn.backup(dest_conn, pages=100, sleep=0.01)
        logger.info("Local SQLite backup completed successfully: %s", backup_filepath)
    finally:
        dest_conn.close()
        src_conn.close()

    # Rotate old local backups
    try:
        backups = sorted([
            os.path.join(PAPERS_BACKUP_DIR, f)
            for f in os.listdir(PAPERS_BACKUP_DIR)
            if f.startswith("papers_backup_") and f.endswith(".db")
        ])
        while len(backups) > max_snapshots:
            oldest = backups.pop(0)
            os.remove(oldest)
            logger.info("Rotated out old snapshot: %s", oldest)
    except Exception as e:
        logger.warning("Error during backup rotation: %s", e)

    # Optional S3 Sync if configured
    if PAPERS_BACKUP_S3_BUCKET:
        sync_to_s3(backup_filepath, backup_filename)

    return backup_filepath


def sync_to_s3(local_path: str, filename: str):
    """Syncs a snapshot to an AWS S3 bucket if boto3 or aws-cli is available."""
    try:
        import subprocess
        s3_uri = f"s3://{PAPERS_BACKUP_S3_BUCKET}/backups/{filename}"
        logger.info("Uploading snapshot to S3: %s", s3_uri)
        res = subprocess.run(["aws", "s3", "cp", local_path, s3_uri], capture_output=True, text=True)
        if res.returncode == 0:
            logger.info("S3 upload successful: %s", s3_uri)
        else:
            logger.error("AWS CLI upload failed: %s", res.stderr)
    except Exception as e:
        logger.error("Failed to sync snapshot to S3: %s", e)


def restore_database(snapshot_path: str) -> bool:
    """Restores database from a snapshot."""
    if not os.path.exists(snapshot_path):
        logger.error("Snapshot path does not exist: %s", snapshot_path)
        return False

    try:
        logger.info("Restoring database from %s to %s", snapshot_path, DATABASE_PATH)
        # Create a pre-restore safety copy of current DB if it exists
        if os.path.exists(DATABASE_PATH):
            shutil.copy2(DATABASE_PATH, f"{DATABASE_PATH}.pre_restore_bak")
        shutil.copy2(snapshot_path, DATABASE_PATH)
        logger.info("Database restoration completed successfully.")
        return True
    except Exception as e:
        logger.error("Failed to restore database: %s", e)
        return False


if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "backup"
    if action == "backup":
        result = backup_database()
        print(f"Backup created: {result}")
    elif action == "restore" and len(sys.argv) > 2:
        success = restore_database(sys.argv[2])
        print(f"Restore status: {success}")
    else:
        print("Usage: python db_backup.py [backup|restore <snapshot_path>]")
