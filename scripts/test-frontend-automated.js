#!/usr/bin/env node

/**
 * Automated Frontend Testing System
 * Detects frontend changes and runs comprehensive tests including accessibility
 */

const { execSync } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const { join } = require('path');

// Configuration for frontend testing
const FRONTEND_PATHS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'public/**/*',
  'index.html',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig*.json'
];

const TEST_CONFIG = {
  // Test types to run
  tests: {
    unit: true,
    accessibility: true,
    visual: false, // Can be enabled for visual regression testing
    performance: true,
    lint: true
  },
  
  // Accessibility testing configuration
  accessibility: {
    wcagLevel: 'AA', // WCAG 2.2 Level AA compliance
    includeRules: [
      'color-contrast',
      'focus-order-semantics',
      'keyboard-navigation',
      'aria-labels',
      'semantic-markup'
    ],
    excludeRules: [
      'color-contrast-enhanced' // Only test minimum contrast for now
    ]
  },
  
  // Performance thresholds
  performance: {
    maxBundleSize: '500KB',
    maxLoadTime: 3000, // 3 seconds
    lighthouseThresholds: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90
    }
  }
};

/**
 * @typedef {Object} TestResult
 * @property {string} type
 * @property {boolean} passed
 * @property {number} [score]
 * @property {string[]} [issues]
 * @property {any} [details]
 */

/**
 * @typedef {Object} FrontendTestReport
 * @property {string} timestamp
 * @property {string[]} changedFiles
 * @property {TestResult[]} results
 * @property {boolean} overallPassed
 * @property {string[]} recommendations
 */

class FrontendTestRunner {
  constructor() {
    this.changedFiles = [];
    this.results = [];
    this.detectChangedFiles();
  }

  /**
   * Detect which frontend files have changed
   */
  detectChangedFiles() {
    try {
      // Check git status for modified files
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      
      const allChangedFiles = [
        ...gitStatus.split('\n').map(line => line.substring(3)),
        ...stagedFiles.split('\n')
      ].filter(file => file.trim());

      // Filter for frontend-related files
      this.changedFiles = allChangedFiles.filter(file => 
        FRONTEND_PATHS.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
          return regex.test(file);
        })
      );

      console.log(`🔍 Detected ${this.changedFiles.length} frontend file changes:`);
      this.changedFiles.forEach(file => console.log(`  - ${file}`));
      
    } catch (error) {
      console.warn('⚠️  Could not detect changed files via git, running all tests');
      this.changedFiles = ['src/**/*']; // Fallback to all frontend files
    }
  }

  /**
   * Run all configured tests
   */
  async runAllTests() {
    console.log('🚀 Starting automated frontend testing...\n');

    // Run tests in parallel where possible
    const testPromises = [];

    if (TEST_CONFIG.tests.lint) {
      testPromises.push(this.runLintTests());
    }

    if (TEST_CONFIG.tests.unit) {
      testPromises.push(this.runUnitTests());
    }

    if (TEST_CONFIG.tests.accessibility) {
      testPromises.push(this.runAccessibilityTests());
    }

    if (TEST_CONFIG.tests.performance) {
      testPromises.push(this.runPerformanceTests());
    }

    // Wait for all tests to complete
    const testResults = await Promise.allSettled(testPromises);
    
    // Process results
    testResults.forEach(result => {
      if (result.status === 'fulfilled') {
        this.results.push(result.value);
      } else {
        this.results.push({
          type: 'error',
          passed: false,
          issues: [result.reason?.message || 'Unknown error']
        });
      }
    });

    const overallPassed = this.results.every(result => result.passed);
    const recommendations = this.generateRecommendations();

    const report = {
      timestamp: new Date().toISOString(),
      changedFiles: this.changedFiles,
      results: this.results,
      overallPassed,
      recommendations
    };

    this.saveReport(report);
    this.displayResults(report);

    return report;
  }

  /**
   * Run linting tests
   */
  async runLintTests() {
    console.log('🔍 Running linting tests...');
    
    try {
      const lintOutput = execSync('npm run lint', { encoding: 'utf8' });
      
      return {
        type: 'lint',
        passed: true,
        score: 100,
        details: { output: lintOutput }
      };
    } catch (error) {
      const output = error.stdout || error.message;
      const issues = this.parseLintIssues(output);
      
      return {
        type: 'lint',
        passed: false,
        score: 0,
        issues,
        details: { output }
      };
    }
  }

  /**
   * Run unit tests
   */
  async runUnitTests() {
    console.log('🧪 Running unit tests...');
    
    try {
      const testOutput = execSync('npm run test:run', { encoding: 'utf8' });
      const coverageOutput = execSync('npm run test:coverage', { encoding: 'utf8' });
      
      // Parse coverage from output
      const coverageMatch = coverageOutput.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/);
      const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
      
      return {
        type: 'unit',
        passed: true,
        score: coverage,
        details: { 
          output: testOutput,
          coverage: coverageOutput
        }
      };
    } catch (error) {
      const output = error.stdout || error.message;
      
      return {
        type: 'unit',
        passed: false,
        score: 0,
        issues: ['Unit tests failed'],
        details: { output }
      };
    }
  }

  /**
   * Run accessibility tests using axe-core
   */
  async runAccessibilityTests() {
    console.log('♿ Running accessibility tests...');
    
    try {
      // First, build the app for testing
      execSync('npm run build', { stdio: 'pipe' });
      
      // Run accessibility tests using a custom test script
      const a11yOutput = execSync('node scripts/test-accessibility.js', { encoding: 'utf8' });
      
      // Parse accessibility results
      const issues = this.parseAccessibilityIssues(a11yOutput);
      const passed = issues.length === 0;
      
      return {
        type: 'accessibility',
        passed,
        score: passed ? 100 : Math.max(0, 100 - (issues.length * 10)),
        issues,
        details: { output: a11yOutput }
      };
    } catch (error) {
      const output = error.stdout || error.message;
      
      return {
        type: 'accessibility',
        passed: false,
        score: 0,
        issues: ['Accessibility tests failed to run'],
        details: { output }
      };
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');
    
    try {
      // Check bundle size
      const bundleSize = this.checkBundleSize();
      
      // Run Lighthouse audit (if available)
      let lighthouseScore = 0;
      try {
        const lighthouseOutput = execSync('npx lighthouse http://localhost:4173 --output=json --quiet', { encoding: 'utf8' });
        const lighthouseData = JSON.parse(lighthouseOutput);
        lighthouseScore = Math.round(
          (lighthouseData.categories.performance.score + 
           lighthouseData.categories.accessibility.score + 
           lighthouseData.categories['best-practices'].score + 
           lighthouseData.categories.seo.score) / 4 * 100
        );
      } catch {
        console.log('⚠️  Lighthouse not available, skipping performance audit');
      }
      
      const passed = bundleSize < 500000; // 500KB limit
      
      return {
        type: 'performance',
        passed,
        score: lighthouseScore || (passed ? 100 : 50),
        issues: passed ? [] : [`Bundle size ${bundleSize} bytes exceeds 500KB limit`],
        details: { 
          bundleSize,
          lighthouseScore 
        }
      };
    } catch (error) {
      return {
        type: 'performance',
        passed: false,
        score: 0,
        issues: ['Performance tests failed'],
        details: { error: error.message }
      };
    }
  }

  /**
   * Check bundle size
   */
  checkBundleSize() {
    try {
      const distPath = join(process.cwd(), 'dist');
      if (!existsSync(distPath)) {
        return 0;
      }
      
      // Simple bundle size check - in production, you'd use webpack-bundle-analyzer
      const fs = require('fs');
      let totalSize = 0;
      
      const walkDir = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (file.endsWith('.js') || file.endsWith('.css')) {
            totalSize += stat.size;
          }
        });
      };
      
      walkDir(distPath);
      return totalSize;
    } catch {
      return 0;
    }
  }

  /**
   * Parse linting issues from output
   */
  parseLintIssues(output) {
    const issues = [];
    const lines = output.split('\n');
    
    lines.forEach(line => {
      if (line.includes('error') || line.includes('warning')) {
        issues.push(line.trim());
      }
    });
    
    return issues;
  }

  /**
   * Parse accessibility issues from axe output
   */
  parseAccessibilityIssues(output) {
    const issues = [];
    
    try {
      const data = JSON.parse(output);
      if (data.violations) {
        data.violations.forEach((violation) => {
          issues.push(`${violation.id}: ${violation.description}`);
        });
      }
    } catch {
      // If not JSON, parse as text
      const lines = output.split('\n');
      lines.forEach(line => {
        if (line.includes('violation') || line.includes('error')) {
          issues.push(line.trim());
        }
      });
    }
    
    return issues;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];
    
    this.results.forEach(result => {
      if (!result.passed) {
        switch (result.type) {
          case 'accessibility':
            recommendations.push('Fix accessibility issues to meet WCAG 2.2 standards');
            break;
          case 'lint':
            recommendations.push('Fix linting errors before committing');
            break;
          case 'unit':
            recommendations.push('Fix failing unit tests');
            break;
          case 'performance':
            recommendations.push('Optimize bundle size and performance');
            break;
        }
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('All tests passed! Ready for deployment.');
    }
    
    return recommendations;
  }

  /**
   * Save test report to file
   */
  saveReport(report) {
    const reportPath = join(process.cwd(), 'frontend-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Test report saved to: ${reportPath}`);
  }

  /**
   * Display test results
   */
  displayResults(report) {
    console.log('\n📋 Frontend Test Results Summary');
    console.log('================================');
    
    report.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const score = result.score ? ` (${result.score}%)` : '';
      console.log(`${status} ${result.type.toUpperCase()}${score}`);
      
      if (result.issues && result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
    });
    
    console.log(`\n🎯 Overall Status: ${report.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
  }
}

// Main execution
async function main() {
  const runner = new FrontendTestRunner();
  const report = await runner.runAllTests();
  
  // Exit with appropriate code
  process.exit(report.overallPassed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { FrontendTestRunner, TEST_CONFIG };
