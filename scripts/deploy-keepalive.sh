#!/bin/bash

# Deploy Keepalive Function to Supabase
# This script deploys the keepalive edge function to keep your Supabase project active

set -e

echo "🚀 Deploying Supabase Keepalive Function..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found"
  echo "Please install it: npm install -g supabase"
  exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
  echo "❌ Not logged in to Supabase"
  echo "Please run: supabase login"
  exit 1
fi

echo "📦 Deploying keepalive function..."
supabase functions deploy keepalive

echo ""
echo "✅ Keepalive function deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure GitHub Actions secrets (SUPABASE_URL and SUPABASE_ANON_KEY)"
echo "2. Test the function manually if needed"
echo "3. The GitHub Actions workflow will run daily to ping this function"
echo ""
echo "To test the function:"
echo "  curl https://YOUR_PROJECT.supabase.co/functions/v1/keepalive \\"
echo "    -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "    -H 'apikey: YOUR_ANON_KEY'"

