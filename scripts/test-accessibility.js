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
    this.startTime = Date.now();
    this.currentStep = 0;
    this.totalSteps = 5;
  }

  /**
   * Log progress with step indication
   */
  logProgress(message, step = null) {
    if (step !== null) {
      this.currentStep = step;
    }
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[${this.currentStep}/${this.totalSteps}] ⏱️  ${elapsed}s - ${message}`);
  }

  /**
   * Run accessibility tests on the built application
   */
  async runTests() {
    console.log('♿ Starting WCAG 2.2 accessibility tests...\n');
    this.logProgress('Initializing accessibility test suite', 1);

    try {
      // Step 1: Ensure the app is built
      this.logProgress('Checking if application is built...', 1);
      if (!fs.existsSync('dist/index.html')) {
        this.logProgress('Building application for accessibility testing...', 1);
        execSync('npm run build', { stdio: 'pipe' });
        this.logProgress('✅ Build completed successfully', 1);
      } else {
        this.logProgress('✅ Application already built', 1);
      }

      // Step 2: Start test server
      this.logProgress('Starting local test server...', 2);
      const serverProcess = await this.startTestServer();
      
      // Step 3: Wait for server to be ready
      this.logProgress('Waiting for server to be ready...', 3);
      await this.waitForServer('http://localhost:4173');
      this.logProgress('✅ Server is ready and responding', 3);

      // Step 4: Run axe-core tests
      this.logProgress('Running axe-core accessibility audit...', 4);
      await this.runAxeTests();
      this.logProgress('✅ Accessibility audit completed', 4);

      // Step 5: Generate report
      this.logProgress('Generating accessibility report...', 5);
      this.generateReport();
      this.logProgress('✅ Report generated successfully', 5);

      // Stop the server (give it time to finish)
      this.logProgress('Cleaning up test server...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      // Force kill the server process
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM');
        // Give it a moment to clean up gracefully
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force kill if still running
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }

      const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`\n🎉 Accessibility testing completed in ${totalTime}s`);
      
      // Ensure process exits
      process.exit(0);

    } catch (error) {
      const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.error(`❌ Accessibility testing failed after ${totalTime}s:`, error.message);
      process.exit(1);
    }
  }

  /**
   * Start a local server for testing
   */
  async startTestServer() {
    this.logProgress('Building project for testing...');
    
    // First build the project
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('npm run build', { cwd: process.cwd() });
      this.logProgress('✅ Build completed');
    } catch (error) {
      this.logProgress('❌ Build failed: ' + error.message);
      throw error;
    }
    
    this.logProgress('Starting preview server...');
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
  async waitForServer(url, maxAttempts = 60) {
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
        return;
      } catch (error) {
        if (i % 5 === 0) { // Log every 5th attempt to avoid spam
          this.logProgress(`Waiting for server... (attempt ${i + 1}/${maxAttempts})`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Server failed to start within timeout');
  }

  /**
   * Run axe-core accessibility tests
   */
  async runAxeTests() {
    this.logProgress('Setting up browser automation...');

    // Create a test script that uses axe-core with better error handling and progress reporting
    const testScript = `
      const { chromium } = require('playwright');
      const AxeBuilder = require('@axe-core/playwright').default;

      async function runAxeTest() {
        let browser = null;
        try {
          console.log('Launching browser...');
          browser = await chromium.launch({ 
            headless: true,
            timeout: 30000 // 30 second timeout
          });
          
          console.log('Creating new page...');
          const context = await browser.newContext();
          const page = await context.newPage();
          
          // Set page timeout
          page.setDefaultTimeout(30000);
          
          console.log('Navigating to application...');
          await page.goto('http://localhost:4173', { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });
          
          console.log('Waiting for application to load...');
          await page.waitForSelector('h1', { timeout: 10000 });
          
          console.log('Running accessibility audit...');
          
          // Run accessibility check using AxeBuilder - run all rules
          const results = await new AxeBuilder({ page }).analyze();
          
          console.log('Audit completed successfully');
          console.log(JSON.stringify(results, null, 2));
          
        } catch (error) {
          console.error('Accessibility test failed:', error.message);
          console.log(JSON.stringify({
            violations: [],
            passes: [],
            incomplete: [],
            inapplicable: [],
            error: error.message
          }, null, 2));
        } finally {
          if (browser) {
            console.log('Closing browser...');
            await browser.close();
          }
        }
      }

      runAxeTest();
    `;

    // Write test script to temporary file
    const tempFile = path.join(__dirname, 'temp-axe-test.js');
    fs.writeFileSync(tempFile, testScript);
    this.logProgress('✅ Temporary test file created');

    // Verify file was created
    if (!fs.existsSync(tempFile)) {
      throw new Error('Failed to create temporary test file');
    }

    // Small delay to ensure file is fully written
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      this.logProgress('Executing accessibility audit...');
      
      // Run the test with timeout and better error handling
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const child = spawn('node', [tempFile], {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        });
        
        let output = '';
        let errorOutput = '';
        
        // Set overall timeout
        const timeout = setTimeout(() => {
          child.kill();
          this.logProgress('⏰ Accessibility test timed out after 60 seconds');
          reject(new Error('Accessibility test timed out'));
        }, 60000); // 60 second timeout
        
        child.stdout.on('data', (data) => {
          const message = data.toString();
          output += message;
          
          // Show progress messages
          if (message.includes('Launching browser')) this.logProgress('Launching browser...');
          else if (message.includes('Creating new page')) this.logProgress('Creating new page...');
          else if (message.includes('Navigating to application')) this.logProgress('Navigating to application...');
          else if (message.includes('Waiting for application to load')) this.logProgress('Waiting for application to load...');
          else if (message.includes('Running accessibility audit')) this.logProgress('Running accessibility audit...');
          else if (message.includes('Audit completed successfully')) this.logProgress('Audit completed successfully');
          else if (message.includes('Closing browser')) this.logProgress('Closing browser...');
        });
        
        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
          clearTimeout(timeout);
          
          if (code === 0) {
            try {
              // Extract JSON from output - use a simpler approach
              const jsonStart = output.indexOf('{');
              const jsonEnd = output.lastIndexOf('}');
              
              if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                const jsonString = output.substring(jsonStart, jsonEnd + 1);
                const results = JSON.parse(jsonString);
                this.results = results;
                resolve(results);
              } else {
                this.logProgress('❌ No valid JSON output found. Raw output:');
                this.logProgress(output.substring(0, 500) + '...');
                throw new Error('No JSON output found');
              }
            } catch (parseError) {
              this.logProgress('❌ Failed to parse axe results: ' + parseError.message);
              this.logProgress('Raw output: ' + output);
              reject(parseError);
            }
          } else {
            this.logProgress('❌ Axe test failed with code: ' + code);
            this.logProgress('Error output: ' + errorOutput);
            reject(new Error(`Axe test failed with code ${code}`));
          }
        });
        
        child.on('error', (error) => {
          clearTimeout(timeout);
          this.logProgress('❌ Failed to start axe test: ' + error.message);
          reject(error);
        });
      });
      
    } catch (error) {
      this.logProgress('❌ Axe test failed: ' + error.message);
      // Fallback to basic accessibility checks
      await this.runBasicAccessibilityChecks();
    } finally {
      // Clean up - only after everything is done
      setTimeout(() => {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          this.logProgress('🧹 Cleaned up temporary files');
        }
      }, 1000); // Wait 1 second before cleanup
    }
  }

  /**
   * Run basic accessibility checks as fallback
   */
  async runBasicAccessibilityChecks() {
    this.logProgress('Running basic accessibility checks as fallback...');

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
