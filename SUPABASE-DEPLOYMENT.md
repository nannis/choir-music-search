# Supabase Deployment Guide for Choir Music Search

## 🎯 Why Supabase?

**Supabase Free Tier Benefits:**
- ✅ **500MB PostgreSQL database** (plenty for music data)
- ✅ **2GB bandwidth** monthly
- ✅ **50,000 monthly active users**
- ✅ **Built-in authentication** (bonus feature!)
- ✅ **Real-time subscriptions** (bonus feature!)
- ✅ **Automatic backups**
- ✅ **Full-text search** with PostgreSQL

## 🚀 Step-by-Step Supabase Setup

### 1. Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create a new project
4. Choose a region close to your users

### 2. Get Database Credentials
1. In your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Copy the **Connection string** (DATABASE_URL)
4. Note your **Project URL** and **API Key**

### 3. Deploy Backend to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your `choir-music-search` repository
4. Set **Root Directory** to `backend`
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   NODE_ENV=production
   CORS_ORIGIN=https://your-domain.com
   ```

### 4. Set Up Database Schema
1. Install Supabase CLI: `npm install -g supabase`
2. Run the setup script: `node setup-supabase.js`
3. Or manually run the SQL from `database/schema-postgresql.sql`

### 5. Deploy Frontend to One.com
1. Update frontend `.env`:
   ```
   VITE_API_BASE_URL=https://your-app.vercel.app/api
   ```
2. Build: `npm run build`
3. Upload `dist` folder to One.com hosting

## 🔧 Configuration Files

### Backend Environment (.env)
```env
# Supabase Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration
PORT=3001
NODE_ENV=production

# API Configuration
CORS_ORIGIN=https://your-domain.com

# External API Configuration
IMSLP_PROXY_URL=https://r.jina.ai/http://imslp.org
MUSESCORE_PROXY_URL=https://r.jina.ai/http://musescore.com
SUNDMUSIK_PROXY_URL=https://r.jina.ai/http://sundmusik.com
```

### Frontend Environment (.env)
```env
# Supabase API Configuration
VITE_API_BASE_URL=https://your-app.vercel.app/api

# One.com Domain Configuration
VITE_SITE_URL=https://your-domain.com

# Feature Flags
VITE_ENABLE_USER_SUBMISSIONS=true
VITE_ENABLE_ADVANCED_FILTERS=true
VITE_ENABLE_SEARCH_SUGGESTIONS=true
```

## 🏗️ Architecture

```
User → One.com Domain → React Frontend (One.com)
                    ↓
              API calls to Vercel
                    ↓
              Node.js Backend (Vercel)
                    ↓
              PostgreSQL Database (Supabase)
```

## 📋 Deployment Checklist

### Backend (Vercel)
- [ ] Supabase project created
- [ ] DATABASE_URL configured in Vercel
- [ ] Backend deployed to Vercel
- [ ] Database schema executed
- [ ] Health check working: `https://your-app.vercel.app/api/health`

### Frontend (One.com)
- [ ] Frontend `.env` updated with Vercel API URL
- [ ] Frontend built and deployed to One.com
- [ ] Domain configured to point to One.com hosting
- [ ] CORS configured for your One.com domain

### Testing
- [ ] Search functionality working
- [ ] Filters working
- [ ] User submissions working
- [ ] All API endpoints responding

## 🧪 Testing Your Setup

### 1. Backend Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### 2. Search Test
```bash
curl "https://your-app.vercel.app/api/search?q=Bach"
```

### 3. Frontend Test
Visit your One.com domain and test the search functionality

## 💰 Cost Breakdown

- **Supabase**: Free tier (500MB DB, 2GB bandwidth)
- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **One.com**: Your existing hosting plan
- **Total**: Essentially free for your use case!

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify Supabase project is active
   - Check SSL settings

2. **CORS Errors**
   - Update CORS_ORIGIN in Vercel environment variables
   - Ensure your One.com domain is correctly configured

3. **Build Failures**
   - Check that all dependencies are in package.json
   - Verify TypeScript compilation

4. **Full-text Search Not Working**
   - Ensure PostgreSQL extensions are enabled
   - Check search_text field is populated

### Supabase Dashboard:
- Monitor database usage
- Check query performance
- View real-time logs

## 🎉 Benefits of This Setup

1. **Cost-effective**: Free tiers cover your needs
2. **Scalable**: Easy to upgrade as you grow
3. **Professional**: Your users see your One.com domain
4. **Fast**: Global CDN and optimized database
5. **Reliable**: Automatic backups and monitoring

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **One.com Support**: Your existing One.com support
- **Community**: Supabase Discord, Vercel Discord

This setup gives you a production-ready, scalable music search platform using your One.com domain!



