#!/bin/bash

# Supabase Edge Functions Setup Script
# This script helps you set up your Choir Music Search with Supabase

echo "🎵 Setting up Choir Music Search with Supabase Edge Functions..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI found"
fi

echo ""
echo "📋 Next steps:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. Copy your Project URL and API Key"
echo "3. Run: supabase init"
echo "4. Run: supabase link --project-ref YOUR_PROJECT_REF"
echo "5. Run: supabase db push"
echo "6. Run: supabase functions deploy choir-music-api"
echo ""
echo "🔧 Frontend Configuration:"
echo "Update your .env file with:"
echo "VITE_API_BASE_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/choir-music-api"
echo ""
echo "📖 Full guide: SUPABASE-EDGE-FUNCTIONS-DEPLOYMENT.md"



