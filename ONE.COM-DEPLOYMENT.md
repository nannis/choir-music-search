# One.com Deployment Guide for Choir Music Search

## 🎯 Overview
This guide sets up automated deployment to one.com hosting for your choir music search application.

## 🏗️ Architecture
```
User → One.com Domain → React Frontend (One.com)
                    ↓
              API calls to Supabase Edge Functions
                    ↓
              Supabase Edge Function (Backend)
                    ↓
              Supabase PostgreSQL Database
```

## 🚀 Deployment Methods

### Method 1: Manual Deployment (Quick)
```bash
# Build the application
npm run build

# Upload dist/ folder contents to one.com via FTP/SFTP
```

### Method 2: Automated Deployment (Recommended)
```bash
# Use the deployment script
npm run deploy:onecom
```

### Method 3: GitHub Actions (Fully Automated)
Push to main branch → Automatic deployment to one.com

## 📋 Prerequisites

1. **One.com Account**: Active hosting account
2. **Domain**: Configured domain pointing to one.com
3. **FTP/SFTP Access**: Credentials for file upload
4. **Supabase Project**: Edge Functions deployed and working

## 🔧 Setup Steps

### Step 1: Configure Environment Variables
Create `.env.production` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://kqjccswtdxkffghuijhu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU

# One.com Configuration
VITE_SITE_URL=https://your-domain.com
VITE_API_BASE_URL=https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api

# Build Configuration
VITE_BUILD_MODE=production
```

### Step 2: Install Deployment Dependencies
```bash
npm install --save-dev ftp-deploy
```

### Step 3: Configure FTP Settings
Create `onecom.config.js`:
```javascript
module.exports = {
  host: 'ftp.your-domain.com',
  user: 'your-ftp-username',
  password: 'your-ftp-password',
  localRoot: './dist',
  remoteRoot: '/public_html',
  include: ['*', '**/*'],
  exclude: ['.DS_Store', 'Thumbs.db'],
  deleteRemote: false,
  forcePasv: true
};
```

## 🛠️ Deployment Scripts

### Package.json Scripts
Add to your `package.json`:
```json
{
  "scripts": {
    "build:prod": "VITE_BUILD_MODE=production npm run build",
    "deploy:onecom": "npm run build:prod && node scripts/deploy-onecom.js",
    "deploy:preview": "npm run build:prod && node scripts/deploy-onecom.js --preview"
  }
}
```

### Deployment Script
Create `scripts/deploy-onecom.js`:
```javascript
const ftpDeploy = require('ftp-deploy');
const config = require('../onecom.config.js');

const args = process.argv.slice(2);
const isPreview = args.includes('--preview');

console.log(`🚀 Deploying to one.com${isPreview ? ' (preview)' : ''}...`);

ftpDeploy
  .deploy({
    ...config,
    remoteRoot: isPreview ? '/preview' : '/public_html'
  })
  .then(res => {
    console.log('✅ Deployment completed successfully!');
    console.log(`🌐 Your site is live at: ${process.env.VITE_SITE_URL}`);
  })
  .catch(err => {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
  });
```

## 🔄 GitHub Actions Workflow

Create `.github/workflows/deploy-onecom.yml`:
```yaml
name: Deploy to One.com

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build:prod
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_SITE_URL: ${{ secrets.VITE_SITE_URL }}
    
    - name: Deploy to One.com
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.ONECOM_FTP_HOST }}
        username: ${{ secrets.ONECOM_FTP_USER }}
        password: ${{ secrets.ONECOM_FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: /public_html/
```

## 🔐 GitHub Secrets Setup

Add these secrets to your GitHub repository:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_SITE_URL`: Your one.com domain
- `ONECOM_FTP_HOST`: Your one.com FTP host
- `ONECOM_FTP_USER`: Your one.com FTP username
- `ONECOM_FTP_PASSWORD`: Your one.com FTP password

## 🧪 Testing Deployment

### Local Testing
```bash
# Test build
npm run build:prod

# Test deployment script
npm run deploy:preview
```

### Production Testing
```bash
# Deploy to production
npm run deploy:onecom

# Test your live site
curl https://your-domain.com
```

## 📊 Deployment Commands

| Command | Purpose |
|---------|---------|
| `npm run build:prod` | Build for production |
| `npm run deploy:onecom` | Deploy to one.com production |
| `npm run deploy:preview` | Deploy to one.com preview |
| `git push origin main` | Trigger GitHub Actions deployment |

## 🔧 Troubleshooting

### Common Issues
1. **FTP Connection Failed**: Check credentials and firewall
2. **Build Errors**: Verify environment variables
3. **CORS Issues**: Update Supabase CORS settings
4. **404 Errors**: Check file paths and routing

### Debug Commands
```bash
# Check build output
ls -la dist/

# Test FTP connection
ftp your-domain.com

# Check environment variables
echo $VITE_SUPABASE_URL
```

## 🎯 Quick Start

1. **Configure**: Update `onecom.config.js` with your FTP details
2. **Build**: Run `npm run build:prod`
3. **Deploy**: Run `npm run deploy:onecom`
4. **Test**: Visit your domain and test search functionality

## 📈 Monitoring

- **Build Status**: Check GitHub Actions tab
- **Site Status**: Monitor your domain
- **API Status**: Test Supabase Edge Functions
- **Performance**: Use browser dev tools

---

**Ready to deploy? Run `npm run deploy:onecom` and your choir music search will be live!** 🎵
