@echo off
echo 🚀 Starting Emotion Companion Backend Server...
echo 📡 Running on all interfaces (0.0.0.0:8000)
echo 📱 Mobile devices can now connect!
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo 💡 Please run setup first or create virtual environment
    echo 💡 Run: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Start Django server on all interfaces
echo 🌐 Starting Django server on 0.0.0.0:8000...
echo 📍 Press Ctrl+C to stop the server
echo.
python manage.py runserver 0.0.0.0:8000

pause