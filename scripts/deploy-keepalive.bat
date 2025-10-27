@echo off

REM Deploy Keepalive Function to Supabase (Windows)
REM This script deploys the keepalive edge function to keep your Supabase project active

echo 🚀 Deploying Supabase Keepalive Function...
echo.

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Supabase CLI not found
  echo Please install it: npm install -g supabase
  exit /b 1
)

REM Check if user is logged in
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Not logged in to Supabase
  echo Please run: supabase login
  exit /b 1
)

echo 📦 Deploying keepalive function...
supabase functions deploy keepalive

echo.
echo ✅ Keepalive function deployed successfully!
echo.
echo Next steps:
echo 1. Configure GitHub Actions secrets (SUPABASE_URL and SUPABASE_ANON_KEY)
echo 2. Test the function manually if needed
echo 3. The GitHub Actions workflow will run daily to ping this function
echo.
echo To test the function:
echo   curl https://YOUR_PROJECT.supabase.co/functions/v1/keepalive -H "Authorization: Bearer YOUR_ANON_KEY" -H "apikey: YOUR_ANON_KEY"

