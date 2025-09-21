# Automated Frontend Testing System

This document describes the comprehensive automated testing system for detecting frontend changes and ensuring WCAG 2.2 compliance.

## Overview

The automated testing system provides:
- **Change Detection**: Automatically detects when frontend files are modified
- **Comprehensive Testing**: Runs unit tests, accessibility tests, performance tests, and linting
- **WCAG 2.2 Compliance**: Ensures accessibility standards are met
- **Pre-commit Hooks**: Prevents commits with failing tests
- **CI/CD Integration**: Automated testing in GitHub Actions

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Frontend Tests
```bash
npm run test:frontend
```

### Run Tests Only for Changed Files
```bash
npm run test:frontend-changes
```

### Run Accessibility Tests Only
```bash
npm run test:accessibility
```

## Test Types

### 1. Unit Tests (`npm run test:run`)
- Tests React components and functionality
- Covers search functionality, error handling, loading states
- Ensures proper API integration

### 2. Accessibility Tests (`npm run test:accessibility`)
- **WCAG 2.2 Compliance**: Tests against Web Content Accessibility Guidelines 2.2
- **axe-core Integration**: Uses industry-standard accessibility testing
- **Screen Reader Compatibility**: Ensures proper semantic markup
- **Keyboard Navigation**: Tests keyboard accessibility
- **Color Contrast**: Validates color contrast ratios
- **Focus Management**: Tests focus indicators and order

### 3. Performance Tests
- **Bundle Size**: Ensures bundle stays under 500KB
- **Lighthouse Audit**: Performance, accessibility, best practices, SEO scores
- **Load Time**: Validates page load performance

### 4. Linting (`npm run lint`)
- **ESLint**: Code quality and consistency
- **TypeScript**: Type checking
- **React**: React-specific linting rules

## WCAG 2.2 Compliance Testing

The system tests against WCAG 2.2 success criteria:

### Perceivable (1.x)
- **1.1.1 Non-text Content**: Alt text for images
- **1.3.1 Info and Relationships**: Semantic markup
- **1.4.3 Contrast (Minimum)**: 4.5:1 contrast ratio
- **1.4.4 Resize Text**: Text scalability

### Operable (2.x)
- **2.1.1 Keyboard**: Keyboard accessibility
- **2.4.1 Bypass Blocks**: Skip links
- **2.4.3 Focus Order**: Logical focus sequence
- **2.4.7 Focus Visible**: Visible focus indicators
- **2.4.11 Focus Not Obscured (Minimum)**: NEW in WCAG 2.2
- **2.4.13 Focus Appearance**: NEW in WCAG 2.2
- **2.5.8 Target Size (Minimum)**: NEW in WCAG 2.2

### Understandable (3.x)
- **3.1.1 Language of Page**: Proper language attributes
- **3.2.1 On Focus**: No unexpected context changes
- **3.3.2 Labels or Instructions**: Form labels

### Robust (4.x)
- **4.1.2 Name, Role, Value**: Proper ARIA attributes

## File Structure

```
scripts/
├── test-frontend-automated.js    # Main test runner
├── test-accessibility.js         # Accessibility testing
└── ...

tests/
├── frontend.test.tsx            # Unit tests
├── accessibility.test.tsx       # Accessibility tests
└── ...

.github/workflows/
└── frontend-tests.yml           # CI/CD pipeline

.husky/
└── pre-commit                   # Pre-commit hook
```

## Configuration

### Test Configuration (`scripts/test-frontend-automated.js`)
```javascript
const TEST_CONFIG = {
  tests: {
    unit: true,
    accessibility: true,
    performance: true,
    lint: true
  },
  accessibility: {
    wcagLevel: 'AA',
    includeRules: [
      'color-contrast',
      'focus-order-semantics',
      'keyboard-navigation',
      'aria-labels',
      'semantic-markup'
    ]
  },
  performance: {
    maxBundleSize: '500KB',
    lighthouseThresholds: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90
    }
  }
};
```

### Frontend File Detection
The system automatically detects changes in:
- `src/**/*.{ts,tsx,js,jsx}`
- `public/**/*`
- `index.html`
- `vite.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `tsconfig*.json`

## Pre-commit Hooks

### Setup
```bash
npm run prepare  # Installs husky
```

### Configuration (`package.json`)
```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "npm run test:frontend-changes"
    ]
  }
}
```

### What Happens on Commit
1. **File Detection**: Checks if frontend files are staged
2. **Linting**: Runs ESLint with auto-fix
3. **Testing**: Runs frontend tests for changed files
4. **Blocking**: Prevents commit if tests fail

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/frontend-tests.yml`)

#### Triggers
- **Push**: To `main` or `develop` branches
- **Pull Request**: To `main` or `develop` branches
- **Path Filtering**: Only runs when frontend files change

#### Jobs

1. **Frontend Tests**
   - Runs on Node.js 18.x and 20.x
   - Unit tests, accessibility tests, linting
   - Uploads test results as artifacts

2. **Accessibility Audit**
   - Lighthouse audit
   - axe-core testing
   - WCAG 2.2 compliance validation
   - Enforces accessibility thresholds

3. **Deploy Preview** (PR only)
   - Deploys preview version
   - Comments PR with preview link

## Test Reports

### Generated Reports
- `frontend-test-report.json`: Comprehensive test results
- `accessibility-report.json`: WCAG compliance details
- `lighthouse-report.json`: Performance audit results

### Report Structure
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "changedFiles": ["src/App.tsx"],
  "results": [
    {
      "type": "accessibility",
      "passed": true,
      "score": 95,
      "issues": []
    }
  ],
  "overallPassed": true,
  "recommendations": ["All tests passed! Ready for deployment."]
}
```

## Troubleshooting

### Common Issues

#### Tests Fail on Commit
```bash
# Check what's failing
npm run test:frontend

# Fix linting issues
npm run lint:fix

# Run specific test type
npm run test:accessibility
```

#### Accessibility Issues
```bash
# Run detailed accessibility report
npm run test:accessibility

# Check specific WCAG criteria
# Look for violations in accessibility-report.json
```

#### Performance Issues
```bash
# Check bundle size
npm run build
ls -la dist/

# Run Lighthouse audit
npx lighthouse http://localhost:4173
```

### Debug Mode
```bash
# Run tests with verbose output
DEBUG=true npm run test:frontend

# Skip pre-commit hooks (not recommended)
git commit --no-verify
```

## Best Practices

### Development Workflow
1. **Make Changes**: Edit frontend files
2. **Test Locally**: `npm run test:frontend-changes`
3. **Fix Issues**: Address any test failures
4. **Commit**: Pre-commit hooks run automatically
5. **Push**: CI/CD pipeline validates changes

### Accessibility Guidelines
1. **Always Test**: Run accessibility tests before committing
2. **Keyboard Navigation**: Ensure all features work with keyboard only
3. **Screen Readers**: Test with actual screen readers
4. **Color Contrast**: Use tools to verify contrast ratios
5. **Semantic HTML**: Use proper HTML elements and ARIA attributes

### Performance Guidelines
1. **Bundle Size**: Keep under 500KB
2. **Lighthouse Scores**: Maintain high scores
3. **Load Time**: Optimize for fast loading
4. **Images**: Compress and optimize images

## Integration with Existing Workflow

### Package.json Scripts
```json
{
  "scripts": {
    "test:frontend": "node scripts/test-frontend-automated.js",
    "test:accessibility": "node scripts/test-accessibility.js",
    "test:frontend-changes": "node scripts/test-frontend-automated.js --changes-only",
    "pre-deploy": "npm run lint && npm run test:coverage && npm run test:frontend && npm run update-version && npm run build:prod"
  }
}
```

### Deployment Integration
The `pre-deploy` script now includes frontend testing:
1. Linting
2. Coverage tests
3. **Frontend tests** (NEW)
4. Version update
5. Production build

## Monitoring and Alerts

### GitHub Actions
- **Status Checks**: Required for PR merging
- **Artifacts**: Test reports available for download
- **Comments**: Automatic PR comments with results

### Local Development
- **Pre-commit**: Immediate feedback on commit
- **Console Output**: Detailed test results
- **Exit Codes**: Proper exit codes for CI integration

## Future Enhancements

### Planned Features
- **Visual Regression Testing**: Screenshot comparisons
- **Cross-browser Testing**: Multiple browser support
- **Mobile Testing**: Mobile-specific accessibility tests
- **Performance Budgets**: More granular performance monitoring
- **Accessibility Dashboard**: Web-based reporting interface

### Contributing
To add new test types or improve existing ones:
1. Update `TEST_CONFIG` in `test-frontend-automated.js`
2. Add corresponding test files
3. Update CI/CD pipeline
4. Update documentation

## Support

For issues or questions:
1. Check test output for specific error messages
2. Review generated reports
3. Consult WCAG 2.2 guidelines
4. Test with actual assistive technologies

---

**Note**: This system ensures your frontend meets modern accessibility standards and maintains high code quality. Regular testing helps catch issues early and ensures a better user experience for all users.
