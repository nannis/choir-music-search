#!/bin/bash

# Setup script for Choir Music Search Backend
# This script helps set up the MySQL database and backend API

echo "🎵 Setting up Choir Music Search Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Check if MySQL is accessible
echo "🔍 Checking MySQL connection..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL client is available"
else
    echo "⚠️  MySQL client not found. You may need to install MySQL client tools."
fi

echo ""
echo "🎯 Next steps:"
echo "1. Update backend/.env with your database credentials:"
echo "   - DB_HOST=tinypaws.se.mysql"
echo "   - DB_USER=your_username"
echo "   - DB_PASSWORD=your_password"
echo "   - DB_NAME=choir_music_search"
echo ""
echo "2. Run the database setup:"
echo "   mysql -h tinypaws.se.mysql -u your_username -p < database/schema.sql"
echo ""
echo "3. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Update your frontend to use the new API:"
echo "   - Set VITE_API_BASE_URL=http://localhost:3001/api in your frontend .env"
echo ""
echo "🚀 Your backend will be ready to serve the choir music search API!"

# Create a simple test script
cat > test-connection.js << 'EOF'
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Database connection successful!');
        await connection.end();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('Please check your .env file and database credentials.');
    }
}

testConnection();
EOF

echo "📋 Created test-connection.js to test your database connection"
echo "   Run: node test-connection.js"




