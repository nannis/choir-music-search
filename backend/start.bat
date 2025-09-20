@echo off
REM Quick setup script for Choir Music Search Backend (Windows)
REM This script will help you get everything running quickly

echo 🎵 Choir Music Search Backend Setup
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo 📝 .env file not found. Let's set up the database connection...
    echo.
    node setup-supabase.js
    if errorlevel 1 (
        echo ❌ Database setup failed
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file found
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Test database connection
echo 🔍 Testing database connection...
echo Testing API health...
curl http://localhost:3001/api/health
if errorlevel 1 (
    echo ❌ Database connection test failed
    echo 💡 Please check your .env file and database credentials
    pause
    exit /b 1
)

echo.
echo 🚀 Starting backend server...
echo 📡 API will be available at: http://localhost:3001/api
echo 🔍 Health check: http://localhost:3001/api/health
echo.

REM Start the server
npm run dev


