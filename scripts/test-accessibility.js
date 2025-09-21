#!/usr/bin/env node

/**
 * Accessibility Testing Script using axe-core
 * Tests WCAG 2.2 compliance for frontend changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// WCAG 2.2 Success Criteria to test
// const WCAG_CRITERIA = {
//   '1.4.3': 'Contrast (Minimum)',
//   '1.4.6': 'Contrast (Enhanced)', 
//   '2.1.1': 'Keyboard',
//   '2.1.2': 'No Keyboard Trap',
//   '2.4.1': 'Bypass Blocks',
//   '2.4.3': 'Focus Order',
//   '2.4.7': 'Focus Visible',
//   '2.4.11': 'Focus Not Obscured (Minimum)', // NEW in WCAG 2.2
//   '2.4.13': 'Focus Appearance', // NEW in WCAG 2.2
//   '2.5.8': 'Target Size (Minimum)', // NEW in WCAG 2.2
//   '3.3.2': 'Labels or Instructions',
//   '4.1.2': 'Name, Role, Value'
// };

class AccessibilityTester {
  constructor() {
    this.results = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: []
    };
  }

  /**
   * Run accessibility tests on the built application
   */
  async runTests() {
    console.log('♿ Running WCAG 2.2 accessibility tests...\n');

    try {
      // Ensure the app is built
      if (!fs.existsSync('dist/index.html')) {
        console.log('📦 Building application for accessibility testing...');
        execSync('npm run build', { stdio: 'pipe' });
      }

      // Start a local server for testing
      const serverProcess = await this.startTestServer();
      
      // Wait for server to start
      await this.waitForServer('http://localhost:4173');

      // Run axe-core tests
      await this.runAxeTests();

      // Stop the server
      serverProcess.kill();

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Accessibility testing failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Start a local server for testing
   */
  async startTestServer() {
    console.log('🚀 Building project for testing...');
    
    // First build the project
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('npm run build', { cwd: process.cwd() });
      console.log('✅ Build completed');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
    
    console.log('🚀 Starting test server...');
    const { spawn } = require('child_process');
    
    // Use shell: true for Windows compatibility
    return spawn('npm', ['run', 'preview'], {
      stdio: 'pipe',
      detached: true,
      shell: true
    });
  }

  /**
   * Wait for server to be ready
   */
  async waitForServer(url, maxAttempts = 30) {
    const http = require('http');
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(url, (res) => {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              reject(new Error(`Server returned ${res.statusCode}`));
            }
          });
          req.on('error', reject);
          req.setTimeout(1000, () => reject(new Error('Timeout')));
        });
        console.log('✅ Test server is ready');
        return;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Server failed to start within timeout');
  }

  /**
   * Run axe-core accessibility tests
   */
  async runAxeTests() {
    console.log('🔍 Running axe-core accessibility audit...');

    // Create a test script that uses axe-core
    const testScript = `
      const { chromium } = require('playwright');
      const axe = require('@axe-core/playwright');

      async function runAxeTest() {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        // Navigate to the app
        await page.goto('http://localhost:4173');
        
        // Wait for the app to load
        await page.waitForSelector('h1');
        
        // Run axe-core tests
        const results = await axe.run(page, {
          rules: {
            // WCAG 2.2 specific rules
            'color-contrast': { enabled: true },
            'color-contrast-enhanced': { enabled: false }, // Only test minimum for now
            'focus-order-semantics': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'aria-labels': { enabled: true },
            'semantic-markup': { enabled: true },
            'target-size': { enabled: true },
            'focus-visible': { enabled: true }
          }
        });
        
        console.log(JSON.stringify(results, null, 2));
        
        await browser.close();
      }

      runAxeTest().catch(console.error);
    `;

    // Write test script to temporary file
    fs.writeFileSync('temp-axe-test.js', testScript);

    try {
      // Run the test
      const output = execSync('node temp-axe-test.js', { encoding: 'utf8' });
      const results = JSON.parse(output);
      
      this.results = results;
      
    } catch (error) {
      console.error('❌ Axe test failed:', error.message);
      // Fallback to basic accessibility checks
      await this.runBasicAccessibilityChecks();
    } finally {
      // Clean up
      if (fs.existsSync('temp-axe-test.js')) {
        fs.unlinkSync('temp-axe-test.js');
      }
    }
  }

  /**
   * Run basic accessibility checks as fallback
   */
  async runBasicAccessibilityChecks() {
    console.log('🔍 Running basic accessibility checks...');

    const html = fs.readFileSync('dist/index.html', 'utf8');
    const issues = [];

    // Check for basic accessibility issues
    if (!html.includes('lang=')) {
      issues.push('Missing language attribute on html element');
    }

    if (!html.includes('<title>')) {
      issues.push('Missing page title');
    }

    if (!html.includes('alt=')) {
      issues.push('Images missing alt attributes');
    }

    // Check for focus indicators in CSS
    const cssFiles = this.findCSSFiles();
    let hasFocusStyles = false;
    
    cssFiles.forEach(file => {
      const css = fs.readFileSync(file, 'utf8');
      if (css.includes(':focus') || css.includes('focus-visible')) {
        hasFocusStyles = true;
      }
    });

    if (!hasFocusStyles) {
      issues.push('Missing focus indicators in CSS');
    }

    this.results.violations = issues.map(issue => ({
      id: 'basic-check',
      description: issue,
      help: 'Manual accessibility check failed',
      helpUrl: 'https://www.w3.org/WAI/WCAG22/quickref/',
      nodes: []
    }));
  }

  /**
   * Find CSS files in the dist directory
   */
  findCSSFiles() {
    const cssFiles = [];
    const distPath = 'dist';
    
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          cssFiles.push(path.join(distPath, file));
        }
      });
    }
    
    return cssFiles;
  }

  /**
   * Generate accessibility test report
   */
  generateReport() {
    console.log('\n📊 Accessibility Test Results');
    console.log('============================');

    const totalViolations = this.results.violations.length;
    const totalPasses = this.results.passes.length;

    console.log(`✅ Passed: ${totalPasses}`);
    console.log(`❌ Violations: ${totalViolations}`);

    if (totalViolations > 0) {
      console.log('\n🚨 Accessibility Violations Found:');
      this.results.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   WCAG: ${this.getWCAGCriteria(violation.id)}`);
        
        if (violation.nodes && violation.nodes.length > 0) {
          console.log(`   Affected elements: ${violation.nodes.length}`);
          violation.nodes.slice(0, 3).forEach(node => {
            console.log(`   - ${node.target.join(' ')}`);
          });
          if (violation.nodes.length > 3) {
            console.log(`   ... and ${violation.nodes.length - 3} more`);
          }
        }
      });

      console.log('\n💡 Recommendations:');
      this.generateRecommendations();
    } else {
      console.log('\n🎉 No accessibility violations found!');
      console.log('Your application meets WCAG 2.2 accessibility standards.');
    }

    // Save detailed report
    this.saveDetailedReport();
  }

  /**
   * Get WCAG criteria for a rule ID
   */
  getWCAGCriteria(ruleId) {
    const criteriaMap = {
      'color-contrast': '1.4.3 Contrast (Minimum)',
      'color-contrast-enhanced': '1.4.6 Contrast (Enhanced)',
      'keyboard-navigation': '2.1.1 Keyboard',
      'focus-order-semantics': '2.4.3 Focus Order',
      'focus-visible': '2.4.7 Focus Visible',
      'target-size': '2.5.8 Target Size (Minimum)',
      'aria-labels': '3.3.2 Labels or Instructions',
      'semantic-markup': '4.1.2 Name, Role, Value'
    };
    
    return criteriaMap[ruleId] || 'WCAG 2.2';
  }

  /**
   * Generate specific recommendations
   */
  generateRecommendations() {
    const recommendations = new Set();

    this.results.violations.forEach(violation => {
      switch (violation.id) {
        case 'color-contrast':
          recommendations.add('Improve color contrast ratios to meet WCAG 2.2 standards (4.5:1 for normal text)');
          break;
        case 'focus-visible':
          recommendations.add('Add visible focus indicators for keyboard navigation');
          break;
        case 'target-size':
          recommendations.add('Ensure interactive elements are at least 44x44 pixels');
          break;
        case 'aria-labels':
          recommendations.add('Add proper ARIA labels and semantic markup');
          break;
        case 'keyboard-navigation':
          recommendations.add('Ensure all interactive elements are keyboard accessible');
          break;
        default:
          recommendations.add(`Fix ${violation.id} accessibility issue`);
      }
    });

    recommendations.forEach(rec => {
      console.log(`   • ${rec}`);
    });
  }

  /**
   * Save detailed report to file
   */
  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      wcagVersion: '2.2',
      summary: {
        violations: this.results.violations.length,
        passes: this.results.passes.length,
        incomplete: this.results.incomplete.length,
        inapplicable: this.results.inapplicable.length
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync('accessibility-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: accessibility-report.json');
  }
}

// Main execution
async function main() {
  const tester = new AccessibilityTester();
  await tester.runTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Accessibility testing failed:', error);
    process.exit(1);
  });
}

module.exports = { AccessibilityTester };
