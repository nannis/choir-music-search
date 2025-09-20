# Frontend Configuration for Railway Deployment

## 🌐 Environment Variables

Create a `.env` file in your project root with:

```env
# Railway API Configuration
VITE_API_BASE_URL=https://your-app-name.railway.app/api

# One.com Domain Configuration
VITE_SITE_URL=https://your-domain.com

# Feature Flags
VITE_ENABLE_USER_SUBMISSIONS=true
VITE_ENABLE_ADVANCED_FILTERS=true
VITE_ENABLE_SEARCH_SUGGESTIONS=true
```

## 🚀 Deployment Steps

### 1. Deploy Backend to Railway
1. Follow `backend/RAILWAY-DEPLOYMENT.md`
2. Note your Railway app URL (e.g., `https://choir-music-search.railway.app`)

### 2. Update Frontend Configuration
1. Update `.env` with your Railway API URL
2. Build the frontend: `npm run build`
3. Deploy to One.com

### 3. One.com Deployment
1. Upload the `dist` folder contents to your One.com hosting
2. Ensure your domain points to the uploaded files
3. Test the connection to Railway API

## 🔧 Configuration Examples

### Development (Local)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Production (Railway + One.com)
```env
VITE_API_BASE_URL=https://choir-music-search.railway.app/api
VITE_SITE_URL=https://your-domain.com
```

## 🧪 Testing Your Setup

1. **Backend Health**: `https://your-app-name.railway.app/api/health`
2. **Search Test**: `https://your-app-name.railway.app/api/search?q=Bach`
3. **Frontend**: Visit your One.com domain and test search functionality

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

## 📋 Checklist

- [ ] Backend deployed to Railway
- [ ] Database setup completed on Railway
- [ ] Frontend `.env` updated with Railway API URL
- [ ] Frontend built and deployed to One.com
- [ ] Domain configured to point to One.com hosting
- [ ] CORS configured for your One.com domain
- [ ] All functionality tested end-to-end



