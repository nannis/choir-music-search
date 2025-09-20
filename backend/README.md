# Choir Music Search Backend

A MySQL-powered backend API for the Choir Music Search application with automated data ingestion and full-text search capabilities.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
cd backend
./start.bat  # Windows
# or
./start.sh   # Linux/Mac
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up Supabase database:**
   ```bash
   node setup-supabase.js
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

## 📋 Prerequisites

- Node.js 16+ and npm
- MySQL database access (tinypaws.se.mysql)
- Database credentials (username/password)

## 🔧 Configuration

The setup script will create a `.env` file with your database credentials:

```env
DB_HOST=tinypaws.se.mysql
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=choir_music_search
```

## 📡 API Endpoints

### Search
- `GET /api/search?q=query&language=Latin&voicing=SATB` - Search songs
- `GET /api/suggestions?q=query` - Get search suggestions
- `GET /api/filters` - Get available filter options

### Songs
- `GET /api/songs/:id` - Get song by ID
- `POST /api/songs` - Add new song
- `PUT /api/songs/:id` - Update song

### User Contributions
- `POST /api/submissions` - Submit new song
- `GET /api/submissions` - Get submissions (admin)
- `POST /api/submissions/:id/approve` - Approve submission

### System
- `GET /api/health` - Health check

## 🗄️ Database Schema

The system creates these tables:
- `songs` - Main music database with full-text search
- `user_submissions` - Community contributions
- `ingestion_jobs` - Automated update jobs
- `query_cache` - Performance caching

## 🔄 Automated Data Ingestion

The system automatically updates from external sources:
- **IMSLP**: Daily at 2 AM
- **MuseScore**: Every 6 hours  
- **Sund Musik**: Weekly

## 🧪 Testing

Test your setup:
```bash
# Test API health
curl http://localhost:3001/api/health

# Test search
curl "http://localhost:3001/api/search?q=Bach"
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check your `.env` file credentials
- Verify database host is accessible
- Ensure database exists

### API Not Responding
- Check if port 3001 is available
- Verify all dependencies are installed
- Check server logs for errors

### Search Not Working
- Verify database schema is installed
- Check if songs table has data
- Test full-text search indexes

## 📊 Performance Features

- **Full-text search** with MySQL
- **Connection pooling** for efficiency
- **Query caching** for speed
- **Pagination** for large results
- **Background processing** for updates

## 🔒 Security

- CORS enabled for frontend
- Input validation and sanitization
- SQL injection protection
- Rate limiting (configurable)

## 📈 Monitoring

Check system health:
```bash
curl http://localhost:3001/api/health
```

View database stats:
```sql
SELECT COUNT(*) FROM songs;
SELECT source, COUNT(*) FROM songs GROUP BY source;
```


