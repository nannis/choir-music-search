# Supabase Edge Functions Deployment Guide

## 🎯 Final Architecture

```
User → One.com Domain → React Frontend (One.com)
                    ↓
              API calls to Supabase Edge Functions
                    ↓
              PostgreSQL Database (Supabase)
```

## 🚀 Step-by-Step Setup

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Create Supabase Project
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Choose region close to your users
5. Note your **Project URL** and **API Key**

### 3. Initialize Local Supabase
```bash
# In your project root
supabase init
```

### 4. Link to Remote Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 5. Deploy Database Schema
```bash
supabase db push
```

### 6. Deploy Edge Function
```bash
supabase functions deploy choir-music-api
```

## 🔧 Configuration

### Environment Variables
Your Supabase project automatically provides:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your API key
- `DATABASE_URL` - Database connection string

### Frontend Configuration
Update your frontend `.env`:
```env
# Supabase Edge Functions API
VITE_API_BASE_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api

# One.com Domain
VITE_SITE_URL=https://your-domain.com
```

## 🌐 API Endpoints

Your API will be available at:
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api/search`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api/health`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api/suggestions`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api/filters`

## 🧪 Testing Your Setup

### 1. Health Check
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api/health
```

### 2. Search Test
```bash
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api/search?q=Bach"
```

### 3. Frontend Test
Visit your One.com domain and test the search functionality

## 📋 Deployment Checklist

### Supabase Setup
- [ ] Supabase project created
- [ ] Database schema deployed (`supabase db push`)
- [ ] Edge function deployed (`supabase functions deploy choir-music-api`)
- [ ] Health check working

### Frontend Setup
- [ ] Frontend `.env` updated with Supabase API URL
- [ ] Frontend built and deployed to One.com
- [ ] Domain configured to point to One.com hosting
- [ ] CORS configured (handled automatically by Edge Function)

### Testing
- [ ] Search functionality working
- [ ] Filters working
- [ ] User submissions working
- [ ] All API endpoints responding

## 💰 Cost: FREE!

- **Supabase**: Free tier (500MB DB + Edge Functions)
- **One.com**: Your existing hosting
- **Total**: $0/month for your use case!

## 🔍 Troubleshooting

### Common Issues:

1. **Edge Function Not Deploying**
   - Check Supabase CLI is logged in: `supabase login`
   - Verify project is linked: `supabase status`

2. **Database Connection Issues**
   - Ensure schema is deployed: `supabase db push`
   - Check migration status: `supabase migration list`

3. **CORS Errors**
   - Edge Function handles CORS automatically
   - Check your frontend API URL is correct

4. **Search Not Working**
   - Verify full-text search index is created
   - Check search_text field is populated

### Supabase Dashboard:
- Monitor Edge Function logs
- Check database usage
- View real-time metrics

## 🎉 Benefits of This Setup

1. **Simplest Architecture**: Only two services (Supabase + One.com)
2. **Cost-effective**: Free tiers cover your needs
3. **Scalable**: Automatic scaling with Supabase
4. **Professional**: Your users see your One.com domain
5. **Future-ready**: Built-in auth and real-time features
6. **Fast**: Global edge network

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions Guide**: https://supabase.com/docs/guides/functions
- **One.com Support**: Your existing One.com support
- **Community**: Supabase Discord

This is the cleanest, simplest architecture possible!



