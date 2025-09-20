@echo off
REM Git-based deployment script for one.com (Windows)
REM Based on: https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/

echo 🚀 Setting up Git-based deployment to one.com...

REM Configuration
set ONECOM_HOST=ssh.czg3h0vh1.service.one
set ONECOM_USER=czg3h0vh1_ssh
set REMOTE_REPO=~/website.git
set WEB_DIR=/www

echo 📋 Configuration:
echo    Host: %ONECOM_HOST%
echo    User: %ONECOM_USER%
echo    Remote Repo: %REMOTE_REPO%
echo    Web Directory: %WEB_DIR%

REM Step 1: Build the application
echo 🔨 Building application...
npm run build:prod

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build completed successfully!

REM Step 2: Add and commit changes
echo 📝 Committing changes...
git add dist/
git commit -m "Deploy: %date% %time%"

REM Step 3: Push to one.com
echo 📤 Pushing to one.com...
set GIT_SSH_COMMAND=ssh -i ~/.ssh/onecom-deploy-key
git push onecom main --force

if %errorlevel% equ 0 (
    echo ✅ Deployment completed successfully!
    echo 🌐 Your site should be live at your domain!
) else (
    echo ❌ Deployment failed!
    exit /b 1
)

