#!/bin/bash

echo "========================================"
echo "AI Question Paper Generator - Frontend"
echo "========================================"
echo ""

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api" > .env.local
fi

echo ""
echo "========================================"
echo "Starting Next.js development server..."
echo "Frontend will run at: http://localhost:3000"
echo "========================================"
echo ""

npm run dev
