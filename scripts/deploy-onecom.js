const ftpDeploy = require('ftp-deploy');
const path = require('path');
const fs = require('fs');

// Load configuration
const configPath = path.join(__dirname, '../onecom.config.js');
if (!fs.existsSync(configPath)) {
  console.error('❌ onecom.config.js not found! Please create it first.');
  console.log('📝 See ONE.COM-DEPLOYMENT.md for configuration details.');
  process.exit(1);
}

const config = require(configPath);
const args = process.argv.slice(2);
const isPreview = args.includes('--preview');
const isDryRun = args.includes('--dry-run');

console.log(`🚀 Deploying to one.com${isPreview ? ' (preview)' : ''}${isDryRun ? ' (dry run)' : ''}...`);

// Validate required fields
const requiredFields = ['host', 'user', 'password', 'localRoot'];
for (const field of requiredFields) {
  if (!config[field]) {
    console.error(`❌ Missing required field: ${field}`);
    process.exit(1);
  }
}

// Set remote root based on preview mode
const deployConfig = {
  ...config,
  remoteRoot: isPreview ? '/preview' : '/public_html',
  dryRun: isDryRun
};

// Add logging
deployConfig.log = console.log;

console.log('📋 Deployment Configuration:');
console.log(`   Host: ${deployConfig.host}`);
console.log(`   User: ${deployConfig.user}`);
console.log(`   Local Root: ${deployConfig.localRoot}`);
console.log(`   Remote Root: ${deployConfig.remoteRoot}`);
console.log(`   Preview Mode: ${isPreview}`);
console.log(`   Dry Run: ${isDryRun}`);

// Check if dist folder exists
if (!fs.existsSync(deployConfig.localRoot)) {
  console.error(`❌ Build folder not found: ${deployConfig.localRoot}`);
  console.log('💡 Run "npm run build:prod" first to create the build.');
  process.exit(1);
}

// Deploy
ftpDeploy
  .deploy(deployConfig)
  .then(res => {
    console.log('✅ Deployment completed successfully!');
    console.log(`📁 Files deployed: ${res.length}`);
    
    if (!isDryRun) {
      const siteUrl = process.env.VITE_SITE_URL || 'https://your-domain.com';
      console.log(`🌐 Your site is live at: ${siteUrl}`);
      console.log('🎵 Test your choir music search application!');
    }
  })
  .catch(err => {
    console.error('❌ Deployment failed:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('💡 Check your FTP host and credentials.');
    } else if (err.code === 'ENOTFOUND') {
      console.log('💡 Check your FTP host address.');
    } else if (err.code === '530') {
      console.log('💡 Check your FTP username and password.');
    }
    
    process.exit(1);
  });
