# Testing Guidelines for Choir Music Search

## 🧪 **Testing Philosophy**

We follow **Test-Driven Development (TDD)** principles:
1. **Write tests first** - Tests should be written before or alongside code
2. **Test behavior, not implementation** - Focus on what the code does, not how
3. **Maintain high coverage** - Aim for 80%+ coverage on all new code
4. **Test edge cases** - Include error conditions, boundary values, and edge cases

## 📋 **Testing Requirements**

### **Mandatory Tests for New Code:**
- ✅ **Unit tests** for all functions and components
- ✅ **Integration tests** for API endpoints and data flows
- ✅ **Error handling tests** for all error scenarios
- ✅ **Edge case tests** for boundary conditions

### **Coverage Thresholds:**
- **Branches**: 80% (if/else, switch statements)
- **Functions**: 80% (all functions must be called)
- **Lines**: 80% (all executable lines)
- **Statements**: 80% (all statements executed)

## 🏗️ **Test Structure**

### **File Organization:**
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
  services/
    api.ts
    api.test.ts
tests/
  integration/
    search.test.ts
  e2e/
    user-flows.test.ts
```

### **Test Naming Convention:**
```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should expected behavior', () => {
      // test implementation
    });
  });
});
```

## 📝 **Test Templates**

### **React Component Test Template:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Expected result')).toBeInTheDocument();
  });

  it('should handle error states', () => {
    render(<ComponentName error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
```

### **API Service Test Template:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from './apiService';

// Mock fetch globally
global.fetch = vi.fn();

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make successful API call', async () => {
    const mockResponse = { data: 'test' };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await apiService.getData();
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(apiService.getData()).rejects.toThrow('Network error');
  });
});
```

### **Edge Function Test Template:**
```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('Edge Function Name', () => {
  it('should handle successful requests', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ success: true })
    };

    (fetch as any).mockResolvedValueOnce(mockResponse);

    const response = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should handle error responses', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' })
    };

    (fetch as any).mockResolvedValueOnce(mockResponse);

    const response = await fetch('https://api.example.com/endpoint');
    expect(response.ok).toBe(false);
  });
});
```

## 🔧 **Testing Tools**

### **Available Commands:**
- `npm run test` - Interactive test mode
- `npm run test:run` - One-time test run
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Visual test interface

### **Coverage Reports:**
- Coverage reports are generated in `coverage/` directory
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`

## 🚫 **Common Testing Mistakes to Avoid**

1. **Testing implementation details** instead of behavior
2. **Not testing error conditions** and edge cases
3. **Writing tests after code** instead of before
4. **Mocking too much** - prefer integration tests when possible
5. **Not cleaning up** mocks between tests
6. **Testing third-party libraries** instead of your code

## ✅ **Pre-commit Checklist**

Before committing any code, ensure:
- [ ] All new functions have tests
- [ ] All new components have tests
- [ ] Error conditions are tested
- [ ] Edge cases are covered
- [ ] Coverage threshold is met (80%+)
- [ ] Tests pass locally
- [ ] No console errors in tests

## 🎯 **Testing Best Practices**

1. **Arrange-Act-Assert (AAA)** pattern:
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = functionUnderTest(input);
     
     // Assert
     expect(result).toBe('expected');
   });
   ```

2. **Use descriptive test names** that explain the behavior
3. **Test one thing per test** - keep tests focused
4. **Use proper mocking** - mock external dependencies
5. **Clean up after tests** - reset mocks and state
6. **Test user interactions** - not just component rendering

## 📚 **Resources**

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development Guide](https://testdriven.io/test-driven-development/)
