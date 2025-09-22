#!/usr/bin/env node

/**
 * Simple Accessibility Testing Script (No Browser Required)
 * Provides basic accessibility checks without browser automation
 */

const fs = require('fs');
const path = require('path');

class SimpleAccessibilityTester {
  constructor() {
    this.results = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: []
    };
    this.startTime = Date.now();
  }

  /**
   * Log progress with timestamp
   */
  logProgress(message) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`⏱️  ${elapsed}s - ${message}`);
  }

  /**
   * Run simple accessibility tests
   */
  async runTests() {
    console.log('♿ Starting simple accessibility tests...\n');
    this.logProgress('Initializing accessibility test suite');

    try {
      // Step 1: Ensure the app is built
      this.logProgress('Checking if application is built...');
      if (!fs.existsSync('dist/index.html')) {
        this.logProgress('Building application for accessibility testing...');
        const { execSync } = require('child_process');
        execSync('npm run build', { stdio: 'pipe' });
        this.logProgress('✅ Build completed successfully');
      } else {
        this.logProgress('✅ Application already built');
      }

      // Step 2: Run HTML accessibility checks
      this.logProgress('Running HTML accessibility checks...');
      await this.checkHTMLAccessibility();

      // Step 3: Run CSS accessibility checks
      this.logProgress('Running CSS accessibility checks...');
      await this.checkCSSAccessibility();

      // Step 4: Run JavaScript accessibility checks
      this.logProgress('Running JavaScript accessibility checks...');
      await this.checkJavaScriptAccessibility();

      // Step 5: Generate report
      this.logProgress('Generating accessibility report...');
      this.generateReport();

      const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`\n🎉 Simple accessibility testing completed in ${totalTime}s`);

    } catch (error) {
      const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.error(`❌ Accessibility testing failed after ${totalTime}s:`, error.message);
      process.exit(1);
    }
  }

  /**
   * Check HTML for accessibility issues
   */
  async checkHTMLAccessibility() {
    const htmlPath = 'dist/index.html';
    if (!fs.existsSync(htmlPath)) {
      throw new Error('dist/index.html not found');
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const issues = [];

    // Check for language attribute
    if (!html.includes('lang=')) {
      issues.push({
        id: 'html-lang',
        description: 'Missing language attribute on html element',
        help: 'Add lang attribute to html element (e.g., <html lang="en">)',
        helpUrl: 'https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=131#language-of-page',
        nodes: [{ target: ['html'] }]
      });
    } else {
      this.results.passes.push({
        id: 'html-lang',
        description: 'HTML element has language attribute'
      });
    }

    // Check for page title
    if (!html.includes('<title>')) {
      issues.push({
        id: 'page-title',
        description: 'Missing page title',
        help: 'Add a descriptive title element',
        helpUrl: 'https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=131#page-titled',
        nodes: [{ target: ['head'] }]
      });
    } else {
      this.results.passes.push({
        id: 'page-title',
        description: 'Page has title element'
      });
    }

    // Check for heading structure
    const headingMatches = html.match(/<h[1-6][^>]*>/gi) || [];
    if (headingMatches.length === 0) {
      issues.push({
        id: 'heading-structure',
        description: 'No heading elements found',
        help: 'Add proper heading structure (h1, h2, etc.)',
        helpUrl: 'https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=131#headings-and-labels',
        nodes: [{ target: ['body'] }]
      });
    } else {
      this.results.passes.push({
        id: 'heading-structure',
        description: `Found ${headingMatches.length} heading elements`
      });
    }

    // Check for form elements
    if (html.includes('<input') || html.includes('<select') || html.includes('<textarea')) {
      this.results.passes.push({
        id: 'form-elements',
        description: 'Form elements found'
      });
    }

    // Check for images without alt attributes
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imagesWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        id: 'image-alt',
        description: `${imagesWithoutAlt.length} images missing alt attributes`,
        help: 'Add alt attributes to all images',
        helpUrl: 'https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=131#non-text-content',
        nodes: imagesWithoutAlt.map((_, index) => ({ target: [`img:nth-child(${index + 1})`] }))
      });
    } else if (imgMatches.length > 0) {
      this.results.passes.push({
        id: 'image-alt',
        description: `All ${imgMatches.length} images have alt attributes`
      });
    }

    this.results.violations.push(...issues);
  }

  /**
   * Check CSS for accessibility issues
   */
  async checkCSSAccessibility() {
    const cssFiles = this.findCSSFiles();
    let hasFocusStyles = false;
    let hasColorContrast = false;

    cssFiles.forEach(file => {
      const css = fs.readFileSync(file, 'utf8');
      
      // Check for focus styles
      if (css.includes(':focus') || css.includes('focus-visible')) {
        hasFocusStyles = true;
      }

      // Check for color contrast considerations
      if (css.includes('color:') && css.includes('background')) {
        hasColorContrast = true;
      }
    });

    if (!hasFocusStyles) {
      this.results.violations.push({
        id: 'focus-styles',
        description: 'Missing focus indicators in CSS',
        help: 'Add visible focus indicators for keyboard navigation',
        helpUrl: 'https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=131#focus-visible',
        nodes: [{ target: ['css'] }]
      });
    } else {
      this.results.passes.push({
        id: 'focus-styles',
        description: 'Focus styles found in CSS'
      });
    }

    if (hasColorContrast) {
      this.results.passes.push({
        id: 'color-contrast',
        description: 'Color and background styles found (manual contrast check recommended)'
      });
    }
  }

  /**
   * Check JavaScript for accessibility issues
   */
  async checkJavaScriptAccessibility() {
    const jsFiles = this.findJSFiles();
    let hasARIA = false;
    let hasKeyboardHandlers = false;

    jsFiles.forEach(file => {
      const js = fs.readFileSync(file, 'utf8');
      
      // Check for ARIA attributes
      if (js.includes('aria-') || js.includes('role=')) {
        hasARIA = true;
      }

      // Check for keyboard event handlers
      if (js.includes('keydown') || js.includes('keyup') || js.includes('keypress')) {
        hasKeyboardHandlers = true;
      }
    });

    if (hasARIA) {
      this.results.passes.push({
        id: 'aria-attributes',
        description: 'ARIA attributes found in JavaScript'
      });
    }

    if (hasKeyboardHandlers) {
      this.results.passes.push({
        id: 'keyboard-handlers',
        description: 'Keyboard event handlers found'
      });
    }
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
   * Find JavaScript files in the dist directory
   */
  findJSFiles() {
    const jsFiles = [];
    const distPath = 'dist';
    
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          jsFiles.push(path.join(distPath, file));
        }
      });
    }
    
    return jsFiles;
  }

  /**
   * Generate accessibility test report
   */
  generateReport() {
    console.log('\n📊 Simple Accessibility Test Results');
    console.log('=====================================');

    const totalViolations = this.results.violations.length;
    const totalPasses = this.results.passes.length;

    console.log(`✅ Passed: ${totalPasses}`);
    console.log(`❌ Violations: ${totalViolations}`);

    if (totalViolations > 0) {
      console.log('\n🚨 Accessibility Issues Found:');
      this.results.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   WCAG: ${this.getWCAGCriteria(violation.id)}`);
      });

      console.log('\n💡 Recommendations:');
      this.generateRecommendations();
    } else {
      console.log('\n🎉 No accessibility issues found!');
      console.log('Your application passes basic accessibility checks.');
    }

    // Save detailed report
    this.saveDetailedReport();
  }

  /**
   * Get WCAG criteria for a rule ID
   */
  getWCAGCriteria(ruleId) {
    const criteriaMap = {
      'html-lang': '3.1.1 Language of Page',
      'page-title': '2.4.2 Page Titled',
      'heading-structure': '1.3.1 Info and Relationships',
      'image-alt': '1.1.1 Non-text Content',
      'focus-styles': '2.4.7 Focus Visible'
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
        case 'html-lang':
          recommendations.add('Add lang attribute to html element: <html lang="en">');
          break;
        case 'page-title':
          recommendations.add('Add descriptive title element: <title>Your Page Title</title>');
          break;
        case 'heading-structure':
          recommendations.add('Add proper heading hierarchy (h1, h2, h3, etc.)');
          break;
        case 'image-alt':
          recommendations.add('Add alt attributes to all images: <img src="..." alt="Description">');
          break;
        case 'focus-styles':
          recommendations.add('Add CSS focus indicators: button:focus { outline: 2px solid blue; }');
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
      testType: 'simple',
      summary: {
        violations: this.results.violations.length,
        passes: this.results.passes.length,
        incomplete: this.results.incomplete.length,
        inapplicable: this.results.inapplicable.length
      },
      results: this.results,
      note: 'This is a simple accessibility check. For comprehensive testing, use browser-based tools like axe-core.'
    };

    fs.writeFileSync('accessibility-report-simple.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: accessibility-report-simple.json');
  }
}

// Main execution
async function main() {
  const tester = new SimpleAccessibilityTester();
  await tester.runTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Simple accessibility testing failed:', error);
    process.exit(1);
  });
}

module.exports = { SimpleAccessibilityTester };
