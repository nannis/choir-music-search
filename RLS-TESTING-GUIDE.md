# RLS Policies Testing Guide

This guide provides multiple ways to test your Row Level Security (RLS) policies to ensure they're working correctly.

## 🧪 Testing Methods

### 1. Automated Script Testing (Recommended)

Run the automated test script to verify RLS policies:

```bash
# Install dependencies first
npm install

# Run the RLS test script
npm run test:rls
```

This script will:
- ✅ Test anonymous user access (should be blocked)
- ✅ Test service role access (should work)
- ✅ Verify RLS is enabled on all tables
- 📊 Provide a detailed test report

### 2. Vitest Unit Tests

Run the comprehensive unit tests:

```bash
# Run RLS-specific tests
npm run test:rls-policies

# Or run all tests
npm run test
```

### 3. Manual Testing in Supabase Dashboard

#### Step 1: Check RLS Status
1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Tables**
3. Check each table (`songs`, `user_submissions`, `ingestion_jobs`)
4. Look for the "RLS" indicator - it should show as **enabled**

#### Step 2: Test Anonymous Access
1. Go to **SQL Editor** in Supabase Dashboard
2. Run these queries one by one:

```sql
-- This should FAIL (permission denied)
SELECT * FROM songs LIMIT 1;

-- This should FAIL (permission denied)
SELECT * FROM user_submissions LIMIT 1;

-- This should FAIL (permission denied)
SELECT * FROM ingestion_jobs LIMIT 1;
```

#### Step 3: Test Service Role Access
1. In **SQL Editor**, these queries should work (using service role):

```sql
-- This should work
SELECT * FROM songs LIMIT 1;

-- This should work
SELECT * FROM user_submissions LIMIT 1;

-- This should work
SELECT * FROM ingestion_jobs LIMIT 1;
```

### 4. API Testing with curl

Test your API endpoints directly:

```bash
# Test anonymous access (should fail)
curl -X GET "https://your-project.supabase.co/rest/v1/songs" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test with service role (should work)
curl -X GET "https://your-project.supabase.co/rest/v1/songs" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## 🔍 What to Look For

### ✅ Success Indicators
- Anonymous queries return "permission denied" errors
- Service role queries return data successfully
- RLS shows as "enabled" on all tables in dashboard
- Test script shows all tests passing

### ❌ Failure Indicators
- Anonymous users can access data
- Service role queries fail
- RLS shows as "disabled" on tables
- Test script shows failures

## 🛠️ Troubleshooting

### Common Issues

#### 1. "RLS not enabled" errors
**Solution**: Run the RLS policies SQL file in Supabase SQL Editor:
```sql
-- Enable RLS on all tables
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
```

#### 2. "Permission denied" for legitimate access
**Solution**: Check if policies are too restrictive:
```sql
-- List all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'songs';
```

#### 3. Anonymous users can still access data
**Solution**: Verify RLS is actually enabled:
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_submissions', 'songs', 'ingestion_jobs');
```

### Debug Queries

Use these queries to debug RLS issues:

```sql
-- Check current user context
SELECT auth.uid(), auth.role();

-- Check user metadata
SELECT raw_user_meta_data FROM auth.users WHERE id = auth.uid();

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_submissions', 'songs', 'ingestion_jobs');

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_submissions', 'songs', 'ingestion_jobs');
```

## 📋 Testing Checklist

- [ ] Run automated test script (`npm run test:rls`)
- [ ] Verify RLS is enabled on all tables in dashboard
- [ ] Test anonymous access (should fail)
- [ ] Test service role access (should work)
- [ ] Check Supabase logs for any errors
- [ ] Test with different user roles (if applicable)
- [ ] Verify policies match your application requirements

## 🚨 Security Notes

- **Never disable RLS** in production
- **Always test** after making policy changes
- **Monitor logs** for unauthorized access attempts
- **Review policies** regularly for security gaps
- **Use service role** only for administrative tasks

## 📞 Getting Help

If you encounter issues:

1. Check the [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
2. Review the test output for specific error messages
3. Check Supabase logs in the dashboard
4. Verify your environment variables are correct
5. Ensure your Supabase project is accessible

## 🔄 Continuous Testing

Consider adding RLS tests to your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Test RLS Policies
  run: npm run test:rls
  env:
    VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

This ensures your RLS policies are always working correctly in all environments.
