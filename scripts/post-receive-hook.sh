#!/bin/bash

# Post-receive hook for one.com Git deployment
# Based on: https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/

echo "🚀 Post-receive hook triggered at $(date)"

# Set the web directory (as per blog post)
WEB_DIR="/www"

# Deploy to web directory
echo "📁 Deploying to $WEB_DIR..."
GIT_WORK_TREE="$WEB_DIR" git checkout -f

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Website updated at $(date)"
else
    echo "❌ Deployment failed!"
    exit 1
fi

