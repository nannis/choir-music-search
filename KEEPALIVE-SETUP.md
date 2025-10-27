# Supabase Keepalive Setup

## Overview

This setup keeps your Supabase project active by automatically pinging it once per day. This prevents the project from going idle and being paused on the free tier.

## Solution Components

1. **Keepalive Edge Function** (`supabase/functions/keepalive/`) - A simple function that queries the database
2. **GitHub Actions Workflow** (`.github/workflows/keepalive.yml`) - Automatically calls the function daily
3. **Deployment Scripts** (`scripts/deploy-keepalive.*`) - Helper scripts to deploy the function

## Setup Instructions

### Step 1: Deploy the Keepalive Function

Run the deployment script for your platform:

**Windows:**
```bash
scripts\deploy-keepalive.bat
```

**Mac/Linux:**
```bash
bash scripts/deploy-keepalive.sh
```

Or manually:
```bash
supabase functions deploy keepalive
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   **Secret 1:**
   - Name: `SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://abcdefghijklmnop.supabase.co`)

   **Secret 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: Your Supabase anonymous/public key (found in project settings → API)

### Step 3: Test the Setup

#### Manual Test (Local):
```bash
# Start local Supabase
supabase start

# Test the function
curl http://localhost:54321/functions/v1/keepalive \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```

#### Production Test:
```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/keepalive \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Keepalive successful",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "totalSongs": 123
}
```

### Step 4: Verify GitHub Actions

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see the "Supabase Keepalive" workflow
4. You can manually trigger it by clicking "Run workflow"

## How It Works

1. **Daily Schedule**: The GitHub Actions workflow runs once per day at 12:00 UTC
2. **HTTP Request**: It makes a GET request to your Supabase keepalive function
3. **Database Query**: The function performs a lightweight query (counts songs)
4. **Activity Recorded**: This activity prevents your project from going idle

## Schedule Configuration

The default schedule runs once per day. To change the frequency, edit `.github/workflows/keepalive.yml`:

```yaml
schedule:
  - cron: '0 12 * * *'  # Run at 12:00 UTC daily
```

Common cron schedules:
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 */12 * * *` - Every 12 hours

## Troubleshooting

### Function Not Responding

**Check deployment:**
```bash
supabase functions list
```

**View logs:**
```bash
supabase functions logs keepalive
```

### GitHub Actions Failing

1. Verify secrets are set correctly in repository settings
2. Check the Actions tab for error details
3. Ensure the edge function is deployed
4. Verify the function URL is correct

### Database Connection Issues

- Make sure RLS (Row Level Security) policies allow the function to read from the `songs` table
- The function uses the service role key, so it should have full access
- Check Supabase project dashboard for any errors

## Cost Impact

This setup is **free** and has minimal impact:
- Edge Function: Free tier includes 500,000 invocations/month
- Database queries: Lightweight count query uses minimal resources
- GitHub Actions: Free tier includes 2,000 minutes/month

## Alternative Approaches

If you prefer not to use GitHub Actions, you can:

1. **Use a cron service**: Set up a cron job on a server or use a service like cron-job.org
2. **Manual pinging**: Use your browser's bookmark with a daily reminder
3. **Uptime monitoring**: Set up a monitoring service like UptimeRobot (free tier available)

## Monitoring

You can monitor the keepalive function in:
1. **Supabase Dashboard** → Edge Functions → keepalive → Logs
2. **GitHub Actions** → Supabase Keepalive → View runs

## Notes

- The keepalive function does minimal work (just counts one row)
- It won't affect your application's performance
- You can disable it anytime by commenting out the workflow or removing the function
- The function is also triggered when you push to main branch (helps during development)

