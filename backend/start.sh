#!/bin/bash

# Quick setup script for Choir Music Search Backend
# This script will help you get everything running quickly

echo "🎵 Choir Music Search Backend Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 .env file not found. Let's set up the database connection..."
    echo ""
    node setup-supabase.js
    if [ $? -ne 0 ]; then
        echo "❌ Database setup failed"
        exit 1
    fi
else
    echo "✅ .env file found"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Test database connection
echo "🔍 Testing database connection..."
echo "Testing API health..."
curl http://localhost:3001/api/health
if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed"
    echo "💡 Please check your .env file and database credentials"
    exit 1
fi

echo ""
echo "🚀 Starting backend server..."
echo "📡 API will be available at: http://localhost:3001/api"
echo "🔍 Health check: http://localhost:3001/api/health"
echo ""

# Start the server
npm run dev


