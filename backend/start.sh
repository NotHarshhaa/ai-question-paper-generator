#!/bin/bash
# Local development start script
# Usage: bash start.sh
set -e

cd "$(dirname "$0")"

# Initialize database
python -c "from database.db import init_db; init_db()"
echo "Database initialised."

# Start with gunicorn if available (Linux), otherwise Flask dev server (Windows/Mac)
if command -v gunicorn &> /dev/null; then
    echo "Starting with gunicorn..."
    exec gunicorn app:app \
        --bind "0.0.0.0:${FLASK_PORT:-5000}" \
        --workers 1 \
        --threads 4 \
        --timeout 300 \
        --log-level info
else
    echo "gunicorn not found (Windows?), using Flask dev server..."
    exec python app.py
fi
