#!/usr/bin/env node

/**
 * Test Generator Script
 * Generates test files for new components and functions
 * Usage: node scripts/generate-test.js <file-path>
 */

const fs = require('fs');
const path = require('path');

function generateTestFile(filePath) {
  const fullPath = path.resolve(filePath);
  const ext = path.extname(fullPath);
  const baseName = path.basename(fullPath, ext);
  const dir = path.dirname(fullPath);
  const testFileName = `${baseName}.test${ext}`;
  const testFilePath = path.join(dir, testFileName);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
  }

  // Check if test file already exists
  if (fs.existsSync(testFilePath)) {
    console.error(`❌ Test file already exists: ${testFilePath}`);
    process.exit(1);
  }

  // Read the source file to understand its structure
  const sourceContent = fs.readFileSync(fullPath, 'utf8');

  let testContent = '';

  if (ext === '.tsx' || ext === '.jsx') {
    // React component test
    testContent = generateComponentTest(baseName, sourceContent);
  } else if (ext === '.ts' || ext === '.js') {
    // Function/service test
    testContent = generateFunctionTest(baseName, sourceContent);
  } else {
    console.error(`❌ Unsupported file type: ${ext}`);
    process.exit(1);
  }

  // Write test file
  fs.writeFileSync(testFilePath, testContent);
  console.log(`✅ Generated test file: ${testFilePath}`);
}

function generateComponentTest(componentName, sourceContent) {
  // Extract props from component
  const propsMatch = sourceContent.match(/interface\s+(\w+Props)\s*{([^}]*)}/);
  const props = propsMatch ? propsMatch[2].split('\n').map(line => {
    const match = line.match(/(\w+)(\?)?:\s*([^;]+)/);
    return match ? { name: match[1], optional: !!match[2], type: match[3].trim() } : null;
  }).filter(Boolean) : [];

  return `import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('should render correctly', () => {
    render(<${componentName} />);
    // Add your assertions here
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<${componentName} />);
    
    // Add your interaction tests here
    // Example:
    // const button = screen.getByRole('button');
    // await user.click(button);
    // expect(screen.getByText('Expected result')).toBeInTheDocument();
  });

  it('should handle props correctly', () => {
    const testProps = {
      // Add test props here
    };
    
    render(<${componentName} {...testProps} />);
    // Add your assertions here
  });

  it('should handle error states', () => {
    // Test error conditions
    render(<${componentName} error="Test error" />);
    // Add your error state assertions here
  });

  it('should handle loading states', () => {
    // Test loading conditions
    render(<${componentName} loading={true} />);
    // Add your loading state assertions here
  });
});
`;
}

function generateFunctionTest(functionName, sourceContent) {
  // Extract function exports
  const exportMatches = sourceContent.match(/export\s+(?:const|function|class)\s+(\w+)/g);
  const functions = exportMatches ? exportMatches.map(match => {
    const nameMatch = match.match(/export\s+(?:const|function|class)\s+(\w+)/);
    return nameMatch ? nameMatch[1] : null;
  }).filter(Boolean) : [functionName];

  return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ${functions.join(', ')} } from './${functionName}';

describe('${functionName}', () => {
  beforeEach(() => {
    // Reset mocks and state before each test
    vi.clearAllMocks();
  });

  describe('${functions[0]}', () => {
    it('should work correctly with valid input', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = ${functions[0]}(input);
      
      // Assert
      expect(result).toBeDefined();
      // Add more specific assertions here
    });

    it('should handle invalid input', () => {
      // Test error conditions
      expect(() => ${functions[0]}(null)).toThrow();
      // Add more error case tests here
    });

    it('should handle edge cases', () => {
      // Test boundary conditions
      const result = ${functions[0]}('');
      expect(result).toBeDefined();
      // Add more edge case tests here
    });
  });

  // Add tests for other exported functions here
  ${functions.slice(1).map(func => `
  describe('${func}', () => {
    it('should work correctly', () => {
      // Add tests for ${func} here
    });
  });`).join('')}
});
`;
}

// Main execution
if (process.argv.length < 3) {
  console.log('Usage: node scripts/generate-test.js <file-path>');
  console.log('Example: node scripts/generate-test.js src/components/Button.tsx');
  process.exit(1);
}

const filePath = process.argv[2];
generateTestFile(filePath);
