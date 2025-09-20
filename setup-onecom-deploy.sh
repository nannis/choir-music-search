#!/bin/bash

# One.com Deployment Setup Script
echo "🚀 Setting up One.com deployment for Choir Music Search..."

# Install FTP deployment dependency
echo "📦 Installing FTP deployment dependency..."
npm install --save-dev ftp-deploy

# Create configuration file if it doesn't exist
if [ ! -f "onecom.config.js" ]; then
    echo "📝 Creating onecom.config.js from template..."
    cp onecom.config.example.js onecom.config.js
    echo "⚠️  Please update onecom.config.js with your FTP credentials!"
else
    echo "✅ onecom.config.js already exists"
fi

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production from template..."
    cp env.production.example .env.production
    echo "⚠️  Please update .env.production with your domain and settings!"
else
    echo "✅ .env.production already exists"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Update onecom.config.js with your FTP credentials"
echo "2. Update .env.production with your domain"
echo "3. Test deployment: npm run deploy:dry-run"
echo "4. Deploy to production: npm run deploy:onecom"
echo ""
echo "📚 See ONE.COM-DEPLOYMENT.md for detailed instructions"
echo "🎵 Ready to deploy your choir music search!"
