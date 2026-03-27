#!/bin/bash

echo "========================================"
echo "AI Question Paper Generator - Backend"
echo "========================================"
echo ""

cd ../backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "========================================"
echo "Starting Flask server..."
echo "Backend will run at: http://127.0.0.1:5000"
echo "========================================"
echo ""

python app.py
