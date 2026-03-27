@echo off
echo ========================================
echo AI Question Paper Generator - Backend
echo ========================================
echo.

cd ..\backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
)

echo Installing dependencies...
pip install -q -r requirements.txt

echo.
echo ========================================
echo Starting Flask server...
echo Backend will run at: http://127.0.0.1:5000
echo ========================================
echo.

python app.py
