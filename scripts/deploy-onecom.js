const SftpClient = require('ssh2-sftp-client');
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

console.log(`🚀 Deploying to one.com via SFTP${isPreview ? ' (preview)' : ''}${isDryRun ? ' (dry run)' : ''}...`);

// Validate required fields
const requiredFields = ['host', 'user', 'password', 'localRoot'];
for (const field of requiredFields) {
  if (!config[field]) {
    console.error(`❌ Missing required field: ${field}`);
    process.exit(1);
  }
}

// Set remote root based on preview mode
const remoteRoot = isPreview ? `${config.remoteRoot}/preview` : config.remoteRoot;

console.log('📋 SFTP Deployment Configuration:');
console.log(`   Host: ${config.host}`);
console.log(`   User: ${config.user}`);
console.log(`   Local Root: ${config.localRoot}`);
console.log(`   Remote Root: ${remoteRoot}`);
console.log(`   Preview Mode: ${isPreview}`);
console.log(`   Dry Run: ${isDryRun}`);

// Check if dist folder exists
if (!fs.existsSync(config.localRoot)) {
  console.error(`❌ Build folder not found: ${config.localRoot}`);
  console.log('💡 Run "npm run build:prod" first to create the build.');
  process.exit(1);
}

// SFTP connection configuration
const sftpConfig = {
  host: config.host,
  username: config.user,
  password: config.password,
  port: config.port || 22,
  readyTimeout: config.timeout || 30000,
  retries: config.retries || 3,
  retryDelay: config.retryDelay || 1000
};

async function deployFiles() {
  const sftp = new SftpClient();
  
  try {
    console.log('🔌 Connecting to SFTP server...');
    await sftp.connect(sftpConfig);
    console.log('✅ Connected successfully!');
    
    if (isDryRun) {
      console.log('🔍 Dry run mode - checking connection only');
      console.log('✅ SFTP connection test passed!');
      return;
    }
    
    // Check if remote directory exists
    console.log('📁 Checking remote directory...');
    const remoteExists = await sftp.exists(remoteRoot);
    if (!remoteExists) {
      console.log(`📁 Creating remote directory: ${remoteRoot}`);
      try {
        await sftp.mkdir(remoteRoot, true);
      } catch (mkdirError) {
        console.log(`⚠️  Could not create directory ${remoteRoot}: ${mkdirError.message}`);
        console.log('📁 Directory may already exist or have different permissions');
        console.log('🔄 Continuing with upload...');
      }
    } else {
      console.log(`✅ Remote directory exists: ${remoteRoot}`);
    }
    
    // Upload files
    console.log('📤 Uploading files...');
    const uploadResult = await sftp.uploadDir(config.localRoot, remoteRoot);
    
    console.log('✅ Deployment completed successfully!');
    console.log(`📁 Files uploaded to: ${remoteRoot}`);
    console.log(`📊 Upload result: ${uploadResult ? 'Success' : 'Failed'}`);
    
    const siteUrl = process.env.VITE_SITE_URL || 'https://your-domain.com';
    console.log(`🌐 Your site is live at: ${siteUrl}`);
    console.log('🎵 Test your choir music search application!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Check your SFTP host and port.');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Check your SFTP host address.');
    } else if (error.code === 'AUTH_FAILED') {
      console.log('💡 Check your SFTP username and password.');
    } else if (error.code === 'TIMEOUT') {
      console.log('💡 Connection timeout. Check your network and SFTP settings.');
    }
    
    process.exit(1);
  } finally {
    if (sftp) {
      await sftp.end();
      console.log('🔌 SFTP connection closed.');
    }
  }
}

// Run deployment
deployFiles().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});