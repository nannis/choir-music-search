#!/bin/bash

# Git-based deployment script for one.com
# Based on: https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/

echo "🚀 Setting up Git-based deployment to one.com..."

# Configuration
ONECOM_HOST="ssh.czg3h0vh1.service.one"
ONECOM_USER="czg3h0vh1_ssh"
REMOTE_REPO="~/website.git"
WEB_DIR="/www"

echo "📋 Configuration:"
echo "   Host: $ONECOM_HOST"
echo "   User: $ONECOM_USER"
echo "   Remote Repo: $REMOTE_REPO"
echo "   Web Directory: $WEB_DIR"

# Step 1: Build the application
echo "🔨 Building application..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 2: Add and commit changes
echo "📝 Committing changes..."
git add dist/
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Step 3: Push to one.com
echo "📤 Pushing to one.com..."
GIT_SSH_COMMAND="ssh -i ~/.ssh/onecom-deploy-key" git push onecom main --force

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your site should be live at your domain!"
else
    echo "❌ Deployment failed!"
    exit 1
fi

