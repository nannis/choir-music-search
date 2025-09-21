@echo off
REM Setup script for automated frontend testing system (Windows)
REM Installs required dependencies and configures the testing environment

echo 🚀 Setting up Automated Frontend Testing System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install npm dependencies
echo 📦 Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install npm dependencies
    pause
    exit /b 1
)

REM Install Playwright browsers for accessibility testing
echo 🎭 Installing Playwright browsers...
call npx playwright install --with-deps
if %errorlevel% neq 0 (
    echo ⚠️  Playwright installation had issues - accessibility tests may not work
)

REM Setup husky for pre-commit hooks
echo 🐕 Setting up pre-commit hooks...
call npm run prepare
if %errorlevel% neq 0 (
    echo ⚠️  Pre-commit hook setup had issues
)

REM Test the setup
echo 🧪 Testing the setup...

REM Run a quick test to ensure everything works
call npm run test:run >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Unit tests are working
) else (
    echo ⚠️  Unit tests failed - check your test setup
)

echo.
echo 🎉 Setup Complete!
echo.
echo 📋 Available Commands:
echo   npm run test:frontend              # Run all frontend tests
echo   npm run test:frontend-changes      # Test only changed files
echo   npm run test:accessibility         # Run accessibility tests only
echo   npm run test:run                   # Run unit tests
echo   npm run lint                       # Run linting
echo.
echo 🔧 Pre-commit hooks are now active!
echo    Frontend tests will run automatically when you commit changes.
echo.
echo 📖 For more information, see FRONTEND-TESTING-GUIDE.md
echo.
echo 🚀 Ready to develop with automated testing!
pause
