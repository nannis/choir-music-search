# Integration Test Status & Solutions

## Current Issue
Our integration tests are failing because the `TEST_JWT_SECRET` environment variable is missing from the Supabase Edge Function configuration.

## Available Test Options

### Option 1: Fix JWT Authentication (Recommended)
1. Follow instructions in: `scripts/setup-jwt-function-secret.md`
2. Run the main integration test: `tests/integration/female-choir-sources.test.ts`

### Option 2: Use Bypass Test (Temporary)
Run the bypass test that doesn't require JWT authentication:
```bash
npm run test tests/integration/female-choir-bypass.test.ts
```

### Option 3: Use Simple Test (Always works)
Run basic functionality test: `tests/integration/simple-female-choir.test.ts`

## Test Commands

```bash
# Run all integration tests (may fail due to JWT issue)
npm run test:integration

# Run specific tests
npm run test tests/integration/female-choir-bypass.test.ts
npm run test tests/integration/simple-female-choir.table.ts

# Debug JWT minting
node scripts/test-jwt-mint-with-auth.js
```

## Expected Behavior

- **With TEST_JWT_SECRET configured**: JWT mint works, integration tests run with bypassed RLS
- **Without TEST_JWT_SECRET**: Tests gracefully handle auth failures and provide clear error messages

## RLS Policy Testing

Once JWT authentication is working, the tests will validate:
- ✅ Songs table structure
- ✅ Source field constraints (CPDL, IMSLP, Musescore, etc.)
- ✅ Voicing constraints (SSA, SSAA, SSAATTBB, SA)
- ✅ Language support
- ✅ Female choir music parser integration

## Documentation Links

- **Setup Instructions**: `scripts/setup-jwt-function-secret.md`
- **Test Status**: `PROJECT_STATUS.md`
- **Testing Guide**: `FRONTEND-TESTING-GUIDE.md`
