# Supabase Keepalive Function

## Purpose

This edge function is designed to keep your Supabase project active by performing periodic database queries. Supabase free tier projects may pause due to inactivity, so this function helps prevent that.

## How It Works

1. The keepalive function performs a lightweight database query (counts songs)
2. A GitHub Actions workflow calls this function daily
3. This keeps the database active and prevents it from going idle

## Deployment

To deploy this function to your Supabase project:

```bash
# Deploy the keepalive function
supabase functions deploy keepalive
```

## Testing

Test the function locally:

```bash
# Test the function
supabase functions serve keepalive
```

Then call it:
```bash
curl http://localhost:54321/functions/v1/keepalive \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```

## GitHub Actions Setup

1. Go to your repository settings on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL (e.g., `https://yourproject.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

The workflow will run automatically once per day at 12:00 UTC.

## Manual Trigger

You can also trigger the keepalive manually from the GitHub Actions tab in your repository.

## Frequency

The default schedule runs once per day, which is sufficient to keep most projects active. You can adjust the frequency in `.github/workflows/keepalive.yml` by modifying the cron schedule.

