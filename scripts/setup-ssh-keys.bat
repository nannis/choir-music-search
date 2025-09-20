@echo off
REM SSH Key setup for one.com Git deployment (Windows)
REM Based on: https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/

echo 🔑 Setting up SSH keys for one.com Git deployment...

REM Configuration
set ONECOM_HOST=ssh.czg3h0vh1.service.one
set ONECOM_USER=czg3h0vh1_ssh
set KEY_NAME=onecom-deploy-key
set KEY_PATH=%USERPROFILE%\.ssh\%KEY_NAME%

echo 📋 Configuration:
echo    Host: %ONECOM_HOST%
echo    User: %ONECOM_USER%
echo    Key Name: %KEY_NAME%
echo    Key Path: %KEY_PATH%

REM Step 1: Create .ssh directory if it doesn't exist
if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"

REM Step 2: Generate SSH key pair using ssh-keygen
echo 🔑 Generating SSH key pair...
ssh-keygen -b 4096 -t rsa -f "%KEY_PATH%" -N ""

if %errorlevel% neq 0 (
    echo ❌ Failed to generate SSH key!
    echo 💡 Make sure OpenSSH is installed on Windows
    echo 💡 You can install it via: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
    exit /b 1
)

echo ✅ SSH key generated successfully!

REM Step 3: Set proper permissions (Windows)
echo 🔒 Setting key permissions...
icacls "%KEY_PATH%" /inheritance:r /grant:r "%USERNAME%:F"
icacls "%KEY_PATH%.pub" /inheritance:r /grant:r "%USERNAME%:F"

REM Step 4: Add key to SSH agent
echo 🔐 Adding key to SSH agent...
ssh-add "%KEY_PATH%"

REM Step 5: Display public key
echo.
echo 📋 NEXT STEPS:
echo 1. Copy the public key below:
echo    ==========================================
type "%KEY_PATH%.pub"
echo    ==========================================
echo.
echo 2. SSH into your one.com server:
echo    ssh %ONECOM_USER%@%ONECOM_HOST%
echo.
echo 3. Create the authorized_keys file:
echo    mkdir -p ~/.ssh
echo    touch ~/.ssh/authorized_keys
echo    chmod 600 ~/.ssh/authorized_keys
echo.
echo 4. Add the public key to ~/.ssh/authorized_keys
echo.
echo 5. Create the remote Git repository:
echo    git init --bare ~/website.git
echo.
echo 6. Set up the post-receive hook:
echo    echo '#!/bin/bash' ^> ~/website.git/hooks/post-receive
echo    echo 'GIT_WORK_TREE=/www git checkout -f' ^>^> ~/website.git/hooks/post-receive
echo    chmod +x ~/website.git/hooks/post-receive
echo.
echo 7. Add one.com as a Git remote:
echo    git remote add onecom %ONECOM_USER%@%ONECOM_HOST%:~/website.git
echo.
echo 8. Test deployment:
echo    npm run deploy:git-win

