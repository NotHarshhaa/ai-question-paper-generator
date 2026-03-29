#!/bin/bash
set -e
echo "Starting AI Question Paper Generator..."

# Render injects $PORT; fall back to $FLASK_PORT or 10000
BIND_PORT=${PORT:-${FLASK_PORT:-10000}}

# Initialize database
python -c "from database.db import init_db; init_db()"
echo "Database initialized."

# Start with gunicorn (always present — listed in requirements.txt)
# --timeout 300  : allow up to 5 min for model loading + generation
# --workers 1    : single worker to stay within Render free-tier RAM
# --threads 4    : concurrent requests within the worker
# (no --preload) : avoids OOM from forking after model load on low-RAM hosts
echo "Starting gunicorn on port ${BIND_PORT}..."
exec gunicorn app:app \
    --bind "0.0.0.0:${BIND_PORT}" \
    --workers 1 \
    --threads 4 \
    --timeout 300 \
    --log-level info
