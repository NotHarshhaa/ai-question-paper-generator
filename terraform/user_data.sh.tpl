#!/bin/bash
# =============================================================================
# Cloud-init bootstrap script — runs as root on first EC2 boot
# All output is logged to /var/log/user-data.log
# =============================================================================
set -e -o pipefail
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

APP_DIR="/opt/${app_name}"
APP_USER="ubuntu"
PYTHON_VERSION="3.11"

echo "======================================================"
echo " AI Question Paper Generator — EC2 Bootstrap"
echo " Repo: ${github_repo}"
echo "======================================================"

# ── 1. System packages ────────────────────────────────────────────────────────
echo "[1/7] Installing system packages..."
apt-get update -y
apt-get install -y \
    software-properties-common \
    python$${PYTHON_VERSION} \
    python$${PYTHON_VERSION}-venv \
    python$${PYTHON_VERSION}-dev \
    python3-pip \
    nginx \
    git \
    curl \
    build-essential

# ── 2. Clone repository ───────────────────────────────────────────────────────
echo "[2/7] Cloning repository..."
git clone "${github_repo}" "$APP_DIR"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# ── 3. Python venv + pip install ─────────────────────────────────────────────
echo "[3/7] Installing Python dependencies..."
cd "$APP_DIR/backend"

sudo -u "$APP_USER" python$${PYTHON_VERSION} -m venv venv
sudo -u "$APP_USER" venv/bin/pip install --upgrade pip --quiet
sudo -u "$APP_USER" venv/bin/pip install -r requirements.txt

# Download NLTK corpora
sudo -u "$APP_USER" venv/bin/python - << 'PYEOF'
import nltk
nltk.download("punkt",     quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)
print("NLTK data ready.")
PYEOF

# ── 4. Environment file ───────────────────────────────────────────────────────
echo "[4/7] Writing .env file..."
cat > "$APP_DIR/backend/.env" << EOF
FLASK_ENV=production
FLASK_DEBUG=0
FLASK_HOST=127.0.0.1
FLASK_PORT=5000

T5_MODEL_NAME=${t5_model_name}
BERT_MODEL_NAME=${bert_model_name}

# Disable T5 on t2.micro (1 GB RAM). Set false on t3.small+ (2 GB+).
DISABLE_T5_MODEL=${disable_t5_model}

TOKENIZERS_PARALLELISM=false
PYTHONUNBUFFERED=1
EOF
chown "$APP_USER":"$APP_USER" "$APP_DIR/backend/.env"

# ── 5. Initialise database ────────────────────────────────────────────────────
echo "[5/7] Initialising database..."
sudo -u "$APP_USER" bash -c "
  cd $APP_DIR/backend
  source venv/bin/activate
  python -c 'from database.db import init_db; init_db(); print(\"Database ready.\")'
"

# ── 6. systemd service ────────────────────────────────────────────────────────
echo "[6/7] Installing systemd service..."
cp "$APP_DIR/deploy/app.service" /etc/systemd/system/ai-question-paper.service

# Patch the service file paths to match actual APP_DIR
sed -i "s|/opt/ai-question-paper-generator|$APP_DIR|g" \
    /etc/systemd/system/ai-question-paper.service

systemctl daemon-reload
systemctl enable ai-question-paper
systemctl start ai-question-paper

# Wait a moment and print status
sleep 5
systemctl status ai-question-paper --no-pager || true

# ── 7. Nginx reverse proxy ────────────────────────────────────────────────────
echo "[7/7] Configuring Nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/ai-question-paper
ln -sf /etc/nginx/sites-available/ai-question-paper \
       /etc/nginx/sites-enabled/ai-question-paper
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# ── Done ──────────────────────────────────────────────────────────────────────
PUBLIC_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 || echo "<public-ip>")

echo ""
echo "======================================================"
echo " Bootstrap complete!"
echo " API:      http://$${PUBLIC_IP}/api/health"
echo " SSH logs: sudo journalctl -u ai-question-paper -f"
echo "======================================================"
