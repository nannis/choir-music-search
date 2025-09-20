# Cursor Workspace Startup Instructions

## Quick Start Commands

### Get Project Status
```bash
npm run status
```
This runs the startup summary script to see where you left off.

### Start Development Servers
```bash
# Frontend (React + Vite)
npm run dev

# Backend (Node.js + Express) 
npm run backend
```

### Setup Project
```bash
npm run setup
```

## AI Assistant Instructions

When starting a new session with the AI assistant:

1. **Run the status command**: `npm run status`
2. **Open these files**: 
   - `CONVERSATION_LOG.md`
   - `PROJECT_STATUS.md`
3. **Tell the AI**: "Please read CONVERSATION_LOG.md and PROJECT_STATUS.md to get up to speed on our choir music search project"

## Project Structure
- `src/` - React frontend
- `backend/` - Node.js backend
- `supabase/` - Database and edge functions
- `CONVERSATION_LOG.md` - Session history
- `PROJECT_STATUS.md` - Project progress tracking

## Current Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + Supabase Edge Functions
- Database: Supabase (PostgreSQL)
- Deployment: Railway (backend) + Vercel/Netlify (frontend)

---
**Last Updated**: [Current Date]


