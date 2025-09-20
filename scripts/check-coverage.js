#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking code coverage thresholds...\n');

try {
  // Run coverage test
  console.log('Running tests with coverage...');
  execSync('npm run test:coverage', { stdio: 'inherit' });
  
  // Check if coverage report exists
  const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
  
  if (fs.existsSync(coveragePath)) {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    
    console.log('\n📊 Coverage Summary:');
    console.log('==================');
    
    const totals = coverage.total;
    const thresholds = {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    };
    
    let allThresholdsMet = true;
    
    Object.keys(thresholds).forEach(key => {
      const percentage = totals[key].pct;
      const threshold = thresholds[key];
      const status = percentage >= threshold ? '✅' : '❌';
      
      console.log(`${status} ${key.padEnd(12)}: ${percentage.toFixed(1)}% (threshold: ${threshold}%)`);
      
      if (percentage < threshold) {
        allThresholdsMet = false;
      }
    });
    
    console.log('\n==================');
    
    if (allThresholdsMet) {
      console.log('🎉 All coverage thresholds met!');
      process.exit(0);
    } else {
      console.log('❌ Some coverage thresholds not met!');
      console.log('📝 Please add more tests to improve coverage.');
      process.exit(1);
    }
  } else {
    console.log('❌ Coverage report not found!');
    console.log('📁 Looking for:', coveragePath);
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Coverage check failed:', error.message);
  process.exit(1);
}
