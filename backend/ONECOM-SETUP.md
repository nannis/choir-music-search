# One.com Database Setup Guide

## 🎯 Getting Your One.com Database Credentials

### Step 1: Access One.com Control Panel
1. Go to https://dbadmin.one.com/index.php?route=/
2. Log in with your One.com account credentials

### Step 2: Find Your Database Information
In the One.com control panel, look for:
- **Database Host**: Usually `mysql.one.com` or `your-domain.com`
- **Database Name**: Usually `yourusername_dbname`
- **Username**: Usually `yourusername_dbname`
- **Password**: The password you set for the database

### Step 3: Create Database (if needed)
If you don't have a database yet:
1. Go to "Database" section
2. Click "Create Database"
3. Choose a name (e.g., `choir_music_search`)
4. Set a password
5. Note down all the credentials

## 🚀 Quick Setup

### Option 1: Automated Setup
```bash
cd backend
node setup-onecom.js
```

### Option 2: Manual Setup
1. Create `.env` file in backend directory:
```env
DB_HOST=mysql.one.com
DB_USER=yourusername_dbname
DB_PASSWORD=your_password
DB_NAME=yourusername_dbname
```

2. Install dependencies:
```bash
npm install
```

3. Test connection:
```bash
node test-connection.js
```

4. Start server:
```bash
npm run dev
```

## 🔧 Common One.com Database Settings

### Typical One.com Configuration:
- **Host**: `mysql.one.com` or `your-domain.com`
- **Port**: `3306` (default MySQL port)
- **SSL**: Usually not required for local connections
- **Username**: `yourusername_dbname`
- **Database**: `yourusername_dbname`

### Example .env file:
```env
DB_HOST=mysql.one.com
DB_USER=johnsmith_choirmusic
DB_PASSWORD=mySecurePassword123
DB_NAME=johnsmith_choirmusic
```

## 🧪 Testing Your Setup

### Test Database Connection:
```bash
node test-connection.js
```

### Test API Health:
```bash
curl http://localhost:3001/api/health
```

### Test Search:
```bash
curl "http://localhost:3001/api/search?q=Bach"
```

## 🐛 Troubleshooting One.com Issues

### Connection Refused:
- Check if host is correct (try `mysql.one.com`)
- Verify database exists in One.com control panel
- Check if your IP is allowed (One.com may restrict access)

### Access Denied:
- Double-check username and password
- Username format is usually `yourusername_dbname`
- Password is case-sensitive

### Database Not Found:
- Create the database in One.com control panel first
- Use the exact database name from One.com

### Timeout Issues:
- One.com databases may have connection limits
- Try reducing connection pool size in server.ts

## 📞 One.com Support

If you're having issues:
1. Check One.com documentation
2. Contact One.com support
3. Verify your hosting plan includes MySQL database
4. Check if database is active and not suspended

## 🎵 Next Steps

Once your database is connected:
1. Your frontend will work with the new backend
2. Search will be much faster
3. New music will be added automatically
4. Users can contribute new songs

The system is designed to work seamlessly with One.com's MySQL hosting!




