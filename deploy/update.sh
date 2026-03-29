#!/bin/bash
# =============================================================================
# Update script — pull latest code and restart service on EC2
# Run as: bash /opt/ai-question-paper-generator/deploy/update.sh
# =============================================================================
set -e

APP_DIR="/opt/ai-question-paper-generator"

echo "Pulling latest code..."
git -C "$APP_DIR" pull

echo "Updating dependencies..."
cd "$APP_DIR/backend"
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate

echo "Restarting service..."
sudo systemctl restart ai-question-paper
sleep 2
sudo systemctl status ai-question-paper --no-pager

echo "Done! Logs: sudo journalctl -u ai-question-paper -f"
