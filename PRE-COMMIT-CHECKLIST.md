# Pre-commit Checklist

## ✅ **Before Every Commit**

### **Code Quality:**
- [ ] Code follows project style guidelines
- [ ] No console.log statements left in code
- [ ] No commented-out code blocks
- [ ] Variable and function names are descriptive
- [ ] Code is properly formatted (run `npm run lint:fix`)

### **Testing Requirements:**
- [ ] **All new functions have tests** (unit tests)
- [ ] **All new components have tests** (component tests)
- [ ] **All new API endpoints have tests** (integration tests)
- [ ] **Error conditions are tested** (try/catch, error states)
- [ ] **Edge cases are covered** (boundary values, empty inputs)
- [ ] **User interactions are tested** (clicks, form submissions)
- [ ] **Tests pass locally** (`npm run test:run`)
- [ ] **Coverage threshold is met** (80%+ - run `npm run test:coverage`)

### **Functionality:**
- [ ] **Feature works as expected** (manual testing)
- [ ] **No breaking changes** (existing functionality still works)
- [ ] **Error handling is implemented** (graceful error messages)
- [ ] **Loading states are handled** (user feedback during async operations)

### **Documentation:**
- [ ] **Code is commented** (complex logic explained)
- [ ] **README updated** (if new features or setup changes)
- [ ] **API documentation updated** (if new endpoints)
- [ ] **Type definitions are complete** (TypeScript interfaces)

## 🚫 **Common Issues to Check:**

### **Testing Issues:**
- [ ] No tests for new code
- [ ] Tests are testing implementation instead of behavior
- [ ] Missing error case tests
- [ ] Tests are flaky or unreliable
- [ ] Coverage below 80%

### **Code Issues:**
- [ ] Hardcoded values that should be configurable
- [ ] Missing input validation
- [ ] No error handling
- [ ] Memory leaks (unclosed event listeners, timers)
- [ ] Security vulnerabilities (XSS, injection attacks)

### **Performance Issues:**
- [ ] Unnecessary re-renders in React components
- [ ] Large bundle sizes
- [ ] Slow API calls without loading states
- [ ] Missing memoization where appropriate

## 🛠️ **Quick Commands:**

```bash
# Run all checks before commit
npm run lint:fix          # Fix linting issues
npm run test:coverage     # Run tests with coverage
npm run build            # Ensure code compiles

# Generate test for new file
npm run test:generate src/components/NewComponent.tsx

# Check coverage report
open coverage/index.html
```

## 📋 **Commit Message Format:**

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

**Examples:**
```
feat(search): add Swedish music search functionality

test(api): add tests for new search endpoint

fix(ui): resolve loading state display issue
```

## ⚠️ **Red Flags - Do NOT Commit:**

- ❌ Tests are failing
- ❌ Coverage below 80%
- ❌ Build is broken
- ❌ Linting errors
- ❌ Console errors in browser
- ❌ Security vulnerabilities
- ❌ Breaking changes without migration plan
- ❌ Hardcoded secrets or credentials
- ❌ Large files (>1MB) that should be in .gitignore
- ❌ Debug code or temporary fixes

## 🎯 **Quality Gates:**

The following will **automatically block** commits:
1. **Tests failing** (pre-commit hook)
2. **Coverage below 80%** (pre-commit hook)
3. **Linting errors** (pre-commit hook)
4. **Build failures** (pre-push hook)

## 📚 **Resources:**

- [Testing Guidelines](./TESTING-GUIDELINES.md)
- [Code Style Guide](./CODE-STYLE.md)
- [API Documentation](./API-DOCS.md)
- [Deployment Guide](./DEPLOYMENT.md)
