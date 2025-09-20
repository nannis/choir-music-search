@echo off
REM One.com Git Deployment Script
REM Based on: https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/

echo 🚀 Starting One.com deployment...

REM Build the project first
echo 📦 Building project...
npm run build:prod

REM Add all changes
echo 📝 Adding changes to Git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Deploy to one.com - %date% %time%"

REM Push to one.com using the first SSH key (for Git operations)
echo ⬆️ Pushing to one.com...
set GIT_SSH_COMMAND=ssh -i "C:\Users\nanni\.ssh\onecom-deploy-key"
git push onecom main

REM Trigger deployment using the second SSH key (for hook execution)
echo 🔧 Triggering deployment hook...
ssh -i "C:\Users\nanni\.ssh\onecom-hook-key" czg3h0vh1_ssh@ssh.czg3h0vh1.service.one "echo 'Deployment triggered'"

echo ✅ Deployment complete!
echo 🌐 Your site should be live at: https://ssaasearch.se
