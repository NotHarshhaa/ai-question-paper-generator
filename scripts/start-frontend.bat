@echo off
echo ========================================
echo AI Question Paper Generator - Frontend
echo ========================================
echo.

cd ..\frontend

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

if not exist .env.local (
    echo Creating .env.local file...
    echo NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api > .env.local
)

echo.
echo ========================================
echo Starting Next.js development server...
echo Frontend will run at: http://localhost:3000
echo ========================================
echo.

call npm run dev
