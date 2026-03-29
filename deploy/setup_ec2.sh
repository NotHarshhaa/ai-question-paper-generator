#!/bin/bash
# =============================================================================
# AI Question Paper Generator — AWS EC2 Setup Script
# Tested on: Ubuntu 22.04 LTS (t2.micro / t3.micro free tier)
# Run once as: bash setup_ec2.sh
# =============================================================================
set -e

APP_DIR="/opt/ai-question-paper-generator"
APP_USER="ubuntu"
PYTHON_VERSION="3.11"
REPO_URL="https://github.com/NotHarshhaa/ai-question-paper-generator"

echo "======================================================"
echo " AI Question Paper Generator — EC2 Setup"
echo "======================================================"

# ------------------------------------------------------------------------------
# 1. System packages
# ------------------------------------------------------------------------------
echo "[1/7] Installing system packages..."
sudo apt-get update -y
sudo apt-get install -y \
    python${PYTHON_VERSION} \
    python${PYTHON_VERSION}-venv \
    python${PYTHON_VERSION}-dev \
    python3-pip \
    nginx \
    git \
    curl \
    build-essential \
    libpq-dev

# ------------------------------------------------------------------------------
# 2. Clone / update repo
# ------------------------------------------------------------------------------
echo "[2/7] Cloning repository..."
if [ -d "$APP_DIR" ]; then
    echo "Directory exists — pulling latest..."
    sudo git -C "$APP_DIR" pull
else
    sudo git clone "$REPO_URL" "$APP_DIR"
fi
sudo chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# ------------------------------------------------------------------------------
# 3. Python virtual environment + dependencies
# ------------------------------------------------------------------------------
echo "[3/7] Setting up Python venv and installing dependencies..."
cd "$APP_DIR/backend"

python${PYTHON_VERSION} -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('punkt_tab', quiet=True); nltk.download('stopwords', quiet=True)"
echo "NLTK data downloaded."

deactivate

# ------------------------------------------------------------------------------
# 4. Create .env file
# ------------------------------------------------------------------------------
echo "[4/7] Creating .env file..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
    cat > "$APP_DIR/backend/.env" << 'EOF'
FLASK_ENV=production
FLASK_DEBUG=0
FLASK_HOST=127.0.0.1
FLASK_PORT=5000

# HuggingFace models
T5_MODEL_NAME=valhalla/t5-small-qg-hl
BERT_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2

# t2.micro has 1 GB RAM — set to false only if you have >= 2 GB RAM
DISABLE_T5_MODEL=true

# Prevent tokenizer deadlock in threaded server
TOKENIZERS_PARALLELISM=false
PYTHONUNBUFFERED=1
EOF
    echo ".env created at $APP_DIR/backend/.env — edit it to change settings."
else
    echo ".env already exists — skipping."
fi

# ------------------------------------------------------------------------------
# 5. Initialize database
# ------------------------------------------------------------------------------
echo "[5/7] Initializing database..."
cd "$APP_DIR/backend"
source venv/bin/activate
python -c "from database.db import init_db; init_db(); print('Database initialised.')"
deactivate

# ------------------------------------------------------------------------------
# 6. Install systemd service
# ------------------------------------------------------------------------------
echo "[6/7] Installing systemd service..."
sudo cp "$APP_DIR/deploy/app.service" /etc/systemd/system/ai-question-paper.service
sudo systemctl daemon-reload
sudo systemctl enable ai-question-paper
sudo systemctl restart ai-question-paper
sleep 3
sudo systemctl status ai-question-paper --no-pager

# ------------------------------------------------------------------------------
# 7. Configure Nginx
# ------------------------------------------------------------------------------
echo "[7/7] Configuring Nginx..."
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/ai-question-paper
sudo ln -sf /etc/nginx/sites-available/ai-question-paper /etc/nginx/sites-enabled/ai-question-paper
sudo rm -f /etc/nginx/sites-enabled/default   # remove default placeholder
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "======================================================"
echo " Setup complete!"
echo "======================================================"
echo " Backend:  http://$(curl -s ifconfig.me):80/api/health"
echo " Logs:     sudo journalctl -u ai-question-paper -f"
echo " Restart:  sudo systemctl restart ai-question-paper"
echo "======================================================"
