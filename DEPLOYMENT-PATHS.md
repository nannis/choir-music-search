# Deployment Paths Configuration

## One.com Deployment Path

The correct deployment path for one.com hosting has been configured and saved:

**Path:** `/customers/b/4/9/czg3h0vh1/webroots/418441ef`

### Configuration Files

1. **`.env.local`** (not tracked by git)
   - Contains: `ONECOM_DEPLOY_PATH=/customers/b/4/9/czg3h0vh1/webroots/418441ef`
   - This file is automatically loaded by the deployment script

2. **`onecom.config.js`** (not tracked by git)
   - Uses environment variable with fallback to the hardcoded path
   - Automatically loads `.env.local` if available

### Usage

The deployment script will automatically use the correct path from the environment variable:

```bash
npm run deploy:onecom
# or
node scripts/deploy-onecom.js
```

### Security

- Both `.env.local` and `onecom.config.js` are excluded from git tracking
- The deployment path is stored securely in local environment files
- No sensitive information is committed to the repository

### Last Updated

- **Date:** 2025-01-25
- **Path Verified:** ✅ Working
- **Deployment Tested:** ✅ Successful
