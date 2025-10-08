# Test JWT Storage Guide

## How to store test JWTs securely

### 1. Get JWT from Supabase
After deploying the `mint-test-token` function, you can get a real JWT:

```bash
# Call the function to get a test JWT
curl -X POST https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/mint-test-token \
  -H "Content-Type: application/json" \
  -H "x-test-environment: true" \
  -d '{"email": "test-integration@example.com", "password": "test-password-123"}'
```

This will return:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...},
  "session": {...},
  "expiresAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Store JWT in environment variable
Create a `.env.test` file (copy from `env.test.example`):

```bash
# Test environment configuration
VITE_SUPABASE_URL=https://kqjccswtdxkffghuijhu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Test JWT token (replace with actual token from step 1)
SUPABASE_TEST_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Optional: User ID for cleanup
SUPABASE_TEST_USER_ID="12345678-1234-1234-1234-123456789012"
```

### 3. Alternative: Store JWT in encrypted file
If you prefer not to use environment variables:

```bash
# Create encrypted JWT file
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." > test-jwt.enc
# Encrypt with password (requires gpg)
gpg -c test-jwt.enc
rm test-jwt.enc

# In tests, decrypt when needed
DECRYPTED_JWT=$(gpg -d test-jwt.enc.gpg)
```

### 4. Update integration tests
The tests will load the JWT from environment:

```typescript
// Load JWT from environment
const testJWT = process.env.SUPABASE_TEST_JWT;

if (!testJWT) {
  throw new Error('SUPABASE_TEST_JWT not set. Run mint-test-token function first.');
}
```

### Security considerations:
- JWTs expire (usually 1 hour), so you'll need to refresh periodically
- Store JWT securely (environment variables, encrypted files)
- Never commit JWTs to git
- Consider using test-specific user accounts that can be cleaned up

### Benefits of this approach:
- ✅ Real Supabase JWT (properly signed)
- ✅ Works with RLS policies
- ✅ Secure storage options
- ✅ Easy to refresh when expired
- ✅ No need to manage Supabase secrets in tests


