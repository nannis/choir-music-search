#!/bin/bash

# SSH Key setup for one.com Git deployment
# Based on: https://www.digitalcomet.be/blog/ssh-and-git-on-one-dot-com/

echo "🔑 Setting up SSH keys for one.com Git deployment..."

# Configuration
ONECOM_HOST="ssh.czg3h0vh1.service.one"
ONECOM_USER="czg3h0vh1_ssh"
KEY_NAME="onecom-deploy-key"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

echo "📋 Configuration:"
echo "   Host: $ONECOM_HOST"
echo "   User: $ONECOM_USER"
echo "   Key Name: $KEY_NAME"
echo "   Key Path: $KEY_PATH"

# Step 1: Generate SSH key pair
echo "🔑 Generating SSH key pair..."
ssh-keygen -b 4096 -t rsa -f "$KEY_PATH" -N ""

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate SSH key!"
    exit 1
fi

echo "✅ SSH key generated successfully!"

# Step 2: Set proper permissions
echo "🔒 Setting key permissions..."
chmod 600 "$KEY_PATH"*
chmod 700 "$HOME/.ssh"

# Step 3: Add key to SSH agent
echo "🔐 Adding key to SSH agent..."
ssh-add "$KEY_PATH"

# Step 4: Display public key
echo ""
echo "📋 NEXT STEPS:"
echo "1. Copy the public key below:"
echo "   =========================================="
cat "$KEY_PATH.pub"
echo "   =========================================="
echo ""
echo "2. SSH into your one.com server:"
echo "   ssh $ONECOM_USER@$ONECOM_HOST"
echo ""
echo "3. Create the authorized_keys file:"
echo "   mkdir -p ~/.ssh"
echo "   touch ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "4. Add the public key to ~/.ssh/authorized_keys"
echo ""
echo "5. Create the remote Git repository:"
echo "   git init --bare ~/website.git"
echo ""
echo "6. Set up the post-receive hook:"
echo "   echo '#!/bin/bash' > ~/website.git/hooks/post-receive"
echo "   echo 'GIT_WORK_TREE=$WEB_DIR git checkout -f' >> ~/website.git/hooks/post-receive"
echo "   chmod +x ~/website.git/hooks/post-receive"
echo ""
echo "7. Add one.com as a Git remote:"
echo "   git remote add onecom $ONECOM_USER@$ONECOM_HOST:~/website.git"
echo ""
echo "8. Test deployment:"
echo "   npm run deploy:git"

