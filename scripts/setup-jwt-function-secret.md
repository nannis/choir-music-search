# Fix for JWT Minting Function

## Issue Found
The mint-test-jwt Edge Function is returning "Server not configured" error because the `TEST_JWT_SECRET` environment variable is missing.

## Solution
You need to add the `TEST_JWT_SECRET` environment variable to your Supabase Edge Function configuration.

### Steps to Fix:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/projects
   - Select your project: `kqjccswtdxkffghuijhu`

2. **Access Edge Functions**
   - Go to: Functions (in left sidebar)
   - Find: `mint-test-jwt`

3. **Add Environment Variable**
   - Click on `mint-test-jwt` function
   - Go to Settings → Secrets
   - Add a new secret:
     - **Name**: `TEST_JWT_SECRET`
     - **Value**: Use a secure random string (at least 32 characters)

4. **Generate Secret Value**
   You can use this command to generate a secure random secret:
   ```bash
   # Generate a secure random secret (32 characters)
   openssl rand -base64 32
   ```
   
   Or use online tools like: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

5. **Redeploy Function** (if needed)
   - After adding the secret, the function should automatically restart
   - If not, you may need to redeploy the function

### Test the Fix
After adding the secret, run our test script to verify it works:
```bash
node scripts/test-jwt-mint-with-auth.js
```

You should see: ✅ SUCCESS! with a valid JWT token containing `role: "test_service"`

---

## Current Status
- ✅ Edge Function code is correct
- ✅ Authentication method is correct (Bearer token + apikey)
- ❌ Missing TEST_JWT_SECRET environment variable
- ❌ Integration tests failing due to this missing secret

## Alternative Temporary Solution
If you can't access the Supabase Dashboard right now, we can modify our integration tests to use a different approach for testing (like using direct database calls with service role key for now).
