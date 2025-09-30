# Test Organization Guide

This document explains the new test organization structure and how to run different types of tests efficiently.

## Test Directory Structure

```
tests/
├── unit/                    # Fast unit tests for individual components/services
│   ├── searchService.test.ts
│   ├── search-service-filters.test.ts
│   └── example-songs.test.tsx
├── frontend/                # Frontend component and UI tests
│   ├── frontend.test.tsx
│   ├── search-filters.test.tsx
│   └── accessibility.test.tsx
├── backend/                 # Backend service and logic tests
│   ├── backend-*.test.ts
│   └── data-ingestion*.test.ts
├── integration/             # Integration and API contract tests
│   ├── api-contract.test.ts
│   ├── edge-function*.test.ts
│   └── integration.test.ts
└── environmental/           # Tests requiring live external services
    └── rls-policies.test.ts
```

## Available Test Commands

### Quick Tests (for development)
```bash
# Run only unit tests (fastest)
npm run test:unit

# Run only frontend tests
npm run test:frontend-only

# Run only accessibility tests
npm run test:accessibility-only

# Run only backend tests
npm run test:backend

# Run only integration tests
npm run test:integration

# Run environmental tests (requires live Supabase)
npm run test:environmental
```

### Specific Test Categories
```bash
# Test specific functionality
npm run test:edge-functions
npm run test:data-ingestion
npm run test:api-contract
npm run test:deployment
npm run test:rls-policies
```

### Watch Mode (for development)
```bash
# Watch all tests
npm run test:watch

# Watch specific categories
npm run test:watch:unit
npm run test:watch:frontend
npm run test:watch:backend
```

### Coverage and Full Suite
```bash
# Run all tests with coverage
npm run test:coverage

# Run all tests (no coverage)
npm run test:run

# Quick test run (basic reporter)
npm run test:quick
```

## Smart Pre-push Hook

The pre-push hook intelligently determines which tests to run based on what files have changed:

### Backend Changes Detected
When any of these files/patterns change:
- `backend/**` - Backend services and logic
- `supabase/**` - Edge functions and database
- `database/**` - Database schemas and migrations
- `scripts/**` - Build and deployment scripts
- `*.sql` - SQL files
- `package.json`, `package-lock.json` - Dependencies
- `vitest.config.ts`, `tsconfig.json` - Test/build configuration

**Runs**: Full comprehensive test suite (`npm run test:run`)
- All unit, frontend, backend, and integration tests
- Coverage checks (60% threshold)
- Build verification
- **Time**: ~60+ seconds

### Frontend-Only Changes
When only frontend files change (e.g., `src/**`, CSS, components):

**Runs**: Essential tests only
- Unit tests (`npm run test:unit`)
- Frontend tests (`npm run test:frontend-only`) 
- Accessibility tests (`npm run test:accessibility-only`)
- Build verification
- **Time**: ~15-20 seconds

### Benefits
- **Smart**: Only runs comprehensive tests when backend code changes
- **Fast**: Frontend changes get quick feedback
- **Thorough**: Backend changes get full validation
- **Reliable**: Ensures backend integrity when needed
- **Environmental**: Excludes tests requiring live services from pre-push

## Environmental Tests

Environmental tests require live external services and are excluded from pre-push hooks:

### RLS Policies Tests
- **Location**: `tests/environmental/rls-policies.test.ts`
- **Purpose**: Verify Row Level Security policies with live Supabase
- **Requirements**: 
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` 
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Run**: `npm run test:environmental`
- **CI/CD**: Included in GitHub Actions workflow

### Why Excluded from Pre-push
- Requires live database connection
- Network-dependent (can fail due to connectivity)
- Slower execution time
- Environment-specific configuration needed

## Development Workflow

### During Development
```bash
# Watch specific tests while coding
npm run test:watch:unit
npm run test:watch:frontend

# Run quick tests before committing
npm run test:unit
npm run test:frontend-only
```

### Before Pushing
```bash
# Run full test suite (optional)
npm run test:run

# Check coverage
npm run test:coverage

# The pre-push hook will run essential tests automatically
```

### CI/CD Pipeline
```bash
# Full test suite with coverage
npm run test:coverage

# All test categories
npm run test:unit
npm run test:frontend-only
npm run test:backend
npm run test:integration
```

## Benefits

1. **Faster Development** - Run only relevant tests during development
2. **Faster Pre-push** - Essential tests only, reducing push time
3. **Better Organization** - Clear separation of test types
4. **Selective Testing** - Test specific functionality without full suite
5. **Watch Mode** - Real-time feedback during development

## Test Categories Explained

### Unit Tests (`tests/unit/`)
- Fast, isolated tests for individual functions/components
- No external dependencies
- Should run in < 5 seconds
- Examples: service functions, utility functions, simple components

### Frontend Tests (`tests/frontend/`)
- React component tests
- UI interaction tests
- Accessibility tests
- Should run in < 30 seconds
- Examples: component rendering, user interactions, accessibility compliance

### Backend Tests (`tests/backend/`)
- Backend service tests
- Database interaction tests
- API logic tests
- Should run in < 60 seconds
- Examples: data ingestion, server logic, database operations

### Integration Tests (`tests/integration/`)
- End-to-end functionality tests
- API contract tests
- External service integration tests
- May take longer (1-5 minutes)
- Examples: full API workflows, edge function tests, deployment tests

## Troubleshooting

### If tests are slow:
1. Use specific test commands instead of full suite
2. Use watch mode for development
3. Check if integration tests are necessary for your changes

### If pre-push is too slow:
1. The hook now runs only essential tests
2. Integration tests show warnings but don't block pushes
3. Consider running full suite manually before important pushes

### If coverage is low:
1. Focus on unit tests first (fastest to write)
2. Add frontend tests for new components
3. Backend tests for new services
4. Integration tests for new features
