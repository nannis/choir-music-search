#!/bin/bash

# Setup script for automated frontend testing system
# Installs required dependencies and configures the testing environment

echo "🚀 Setting up Automated Frontend Testing System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Install Playwright browsers for accessibility testing
echo "🎭 Installing Playwright browsers..."
npx playwright install --with-deps

# Setup husky for pre-commit hooks
echo "🐕 Setting up pre-commit hooks..."
npm run prepare

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/test-frontend-automated.js
chmod +x scripts/test-accessibility.js
chmod +x .husky/pre-commit

# Test the setup
echo "🧪 Testing the setup..."

# Run a quick test to ensure everything works
if npm run test:run > /dev/null 2>&1; then
    echo "✅ Unit tests are working"
else
    echo "⚠️  Unit tests failed - check your test setup"
fi

# Test accessibility script
if node scripts/test-accessibility.js --help > /dev/null 2>&1; then
    echo "✅ Accessibility testing script is ready"
else
    echo "⚠️  Accessibility testing script needs attention"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Available Commands:"
echo "  npm run test:frontend              # Run all frontend tests"
echo "  npm run test:frontend-changes      # Test only changed files"
echo "  npm run test:accessibility         # Run accessibility tests only"
echo "  npm run test:run                   # Run unit tests"
echo "  npm run lint                       # Run linting"
echo ""
echo "🔧 Pre-commit hooks are now active!"
echo "   Frontend tests will run automatically when you commit changes."
echo ""
echo "📖 For more information, see FRONTEND-TESTING-GUIDE.md"
echo ""
echo "🚀 Ready to develop with automated testing!"
