@echo off
REM One.com Deployment Setup Script for Windows
echo 🚀 Setting up One.com deployment for Choir Music Search...

REM Install FTP deployment dependency
echo 📦 Installing FTP deployment dependency...
npm install --save-dev ftp-deploy

REM Create configuration file if it doesn't exist
if not exist "onecom.config.js" (
    echo 📝 Creating onecom.config.js from template...
    copy onecom.config.example.js onecom.config.js
    echo ⚠️  Please update onecom.config.js with your FTP credentials!
) else (
    echo ✅ onecom.config.js already exists
)

REM Create production environment file if it doesn't exist
if not exist ".env.production" (
    echo 📝 Creating .env.production from template...
    copy env.production.example .env.production
    echo ⚠️  Please update .env.production with your domain and settings!
) else (
    echo ✅ .env.production already exists
)

echo.
echo 🎯 Next Steps:
echo 1. Update onecom.config.js with your FTP credentials
echo 2. Update .env.production with your domain
echo 3. Test deployment: npm run deploy:dry-run
echo 4. Deploy to production: npm run deploy:onecom
echo.
echo 📚 See ONE.COM-DEPLOYMENT.md for detailed instructions
echo 🎵 Ready to deploy your choir music search!
pause
