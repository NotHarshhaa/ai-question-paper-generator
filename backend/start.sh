#!/bin/bash
echo "Starting AI Question Paper Generator..."

# Initialize database
python -c "from database.db import init_db; init_db()"
echo "Database initialized."

# Start Flask app
python app.py
