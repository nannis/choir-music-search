# Railway Deployment Guide for Choir Music Search

## 🚀 Step-by-Step Railway Setup

### 1. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

### 2. Create New Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your `choir-music-search` repository
4. Choose the `backend` folder as the root directory

### 3. Add MySQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "MySQL"
3. Railway will automatically create a MySQL database
4. Note the `DATABASE_URL` that's automatically provided

### 4. Configure Environment Variables
In Railway dashboard, add these environment variables:

```
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
IMSLP_PROXY_URL=https://r.jina.ai/http://imslp.org
MUSESCORE_PROXY_URL=https://r.jina.ai/http://musescore.com
SUNDMUSIK_PROXY_URL=https://r.jina.ai/http://sundmusik.com
```

### 5. Deploy
1. Railway will automatically deploy when you push to GitHub
2. Your API will be available at: `https://your-app-name.railway.app`

## 🔧 Database Setup

### Option A: Use Railway's Database Setup Script
```bash
# In Railway's console (or locally with Railway CLI)
node setup-railway.js
```

### Option B: Manual Database Setup
1. Connect to your Railway MySQL database
2. Run the SQL commands from `database/schema.sql`
3. Insert initial data

## 🌐 Frontend Configuration

Update your frontend `.env` file:
```
VITE_API_BASE_URL=https://your-app-name.railway.app/api
```

## 📋 Railway CLI (Optional)

Install Railway CLI for easier management:
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## 🎯 Final Architecture

```
User → One.com Domain → React Frontend (One.com)
                    ↓
              API calls to Railway
                    ↓
              Node.js Backend (Railway)
                    ↓
              MySQL Database (Railway)
```

## 💰 Cost Estimate

- **Railway Free Tier**: $5 credit monthly (covers small projects)
- **One.com**: Your existing hosting plan
- **Total**: Essentially free for your use case

## 🔍 Testing Your Deployment

1. **Health Check**: `https://your-app-name.railway.app/api/health`
2. **Search Test**: `https://your-app-name.railway.app/api/search?q=Bach`
3. **Frontend**: Update your React app to use the Railway API URL

## 🚨 Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure `DATABASE_URL` is set correctly
2. **CORS Issues**: Update `CORS_ORIGIN` to your One.com domain
3. **Build Failures**: Check that all dependencies are in `package.json`

### Railway Logs:
```bash
railway logs
```

## 📞 Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- One.com Support: Your existing One.com support



