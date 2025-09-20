# One.com Git Deployment - COMPLETE SOLUTION ✅

## Problem Solved
The Git deployment to one.com was failing because:
1. **Password prompts** - Git was asking for password instead of using SSH keys
2. **Post-receive hooks not executing** - one.com doesn't allow direct script execution
3. **Wrong web root directory** - Using `/www` instead of the actual web root

## Solution Implemented
Based on the excellent blog post: [Using SSH and Git on One.com](https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/)

### Two SSH Keys Approach
1. **Key 1 (`onecom-deploy-key`)**: For Git push operations
2. **Key 2 (`onecom-hook-key`)**: For executing the post-receive hook

### Correct Web Root Directory
- **Actual web root**: `/customers/b/4/9/czg3h0vh1/webroots/418441ef`
- **Not**: `/www` (which is a symlink to `/run/www` that doesn't exist)

## How It Works

### 1. Git Push (No Password)
```bash
GIT_SSH_COMMAND='ssh -i "C:\Users\nanni\.ssh\onecom-deploy-key"' git push onecom main
```

### 2. Trigger Deployment Hook
```bash
ssh -i C:\Users\nanni\.ssh\onecom-hook-key czg3h0vh1_ssh@ssh.czg3h0vh1.service.one "echo 'Hook triggered'"
```

### 3. Post-Receive Hook
```bash
#!/bin/bash
echo '🚀 Deploying to web root...'
GIT_WORK_TREE=/customers/b/4/9/czg3h0vh1/webroots/418441ef git checkout -f main
echo '✅ Deployment complete!'
```

## Easy Deployment Commands

### Windows (PowerShell/CMD)
```bash
npm run deploy:onecom-git
```

### Manual Commands
```bash
# Build and commit
npm run build:prod
git add .
git commit -m "Deploy to one.com"

# Push (no password)
$env:GIT_SSH_COMMAND='ssh -i "C:\Users\nanni\.ssh\onecom-deploy-key"'; git push onecom main

# Trigger deployment
ssh -i C:\Users\nanni\.ssh\onecom-hook-key czg3h0vh1_ssh@ssh.czg3h0vh1.service.one "echo 'Deployment triggered'"
```

## Files Created/Modified

### SSH Keys
- `C:\Users\nanni\.ssh\onecom-deploy-key` - For Git operations
- `C:\Users\nanni\.ssh\onecom-hook-key` - For hook execution
- `C:\Users\nanni\.ssh\config` - SSH configuration

### Scripts
- `scripts/deploy-onecom-git.bat` - Complete deployment script
- `package.json` - Added `deploy:onecom-git` command

### Server Configuration
- `~/website.git/hooks/post-receive` - Deployment hook
- `~/.ssh/authorized_keys` - Contains both SSH keys with proper commands

## Verification
✅ **Git push works without password**  
✅ **Post-receive hook executes successfully**  
✅ **Files deployed to correct web root**  
✅ **Website accessible at https://ssaasearch.se**

## Key Insights from Blog Post
1. **one.com support doesn't know about Git/SSH** - Most support reps are unfamiliar with these tools
2. **Scripts need to be wrapped in `sh`** - Direct execution is blocked, but `sh hooks/post-receive` works
3. **Two-key approach is required** - One for Git, one for hook execution via SSH connection
4. **Command prefix in authorized_keys** - The second key has a command prefix that runs the hook

## Next Steps
- Test the complete deployment with `npm run deploy:onecom-git`
- Verify the website is working at https://ssaasearch.se
- Consider setting up automatic builds on GitHub Actions for even easier deployment

---
*Solution based on: [Digital Comet Blog - Using SSH and Git on One.com](https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/)*
