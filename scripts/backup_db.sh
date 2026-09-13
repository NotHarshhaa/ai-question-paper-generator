#!/usr/bin/env bash
# =============================================================================
# backup_db.sh — Automated SQLite Database Backup Script for Cron / Systemd
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/../backend" && pwd)"

# Activate virtualenv if present
if [ -d "${BACKEND_DIR}/venv" ]; then
    source "${BACKEND_DIR}/venv/bin/activate"
elif [ -d "/opt/venv" ]; then
    source "/opt/venv/bin/activate"
fi

cd "${BACKEND_DIR}"
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Triggering scheduled database backup..."
python utils/db_backup.py backup
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup execution completed."
