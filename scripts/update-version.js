#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current git commit hash
const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const shortCommit = gitCommit.substring(0, 7);

// Get current date
const buildDate = new Date().toISOString().split('T')[0];

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const appVersion = packageJson.version || '1.0.0';

console.log(`🔄 Updating version info:`);
console.log(`   App Version: ${appVersion}`);
console.log(`   Build Date: ${buildDate}`);
console.log(`   Git Commit: ${gitCommit}`);
console.log(`   Short Commit: ${shortCommit}`);

// Update index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Update meta tags
indexContent = indexContent.replace(
  /<meta name="app-version" content="[^"]*" \/>/,
  `<meta name="app-version" content="${appVersion}" />`
);
indexContent = indexContent.replace(
  /<meta name="build-date" content="[^"]*" \/>/,
  `<meta name="build-date" content="${buildDate}" />`
);
indexContent = indexContent.replace(
  /<meta name="deployment-id" content="[^"]*" \/>/,
  `<meta name="deployment-id" content="${gitCommit}" />`
);

// Update JavaScript variables
indexContent = indexContent.replace(
  /window\.APP_VERSION = '[^']*';/,
  `window.APP_VERSION = '${appVersion}';`
);
indexContent = indexContent.replace(
  /window\.BUILD_DATE = '[^']*';/,
  `window.BUILD_DATE = '${buildDate}';`
);
indexContent = indexContent.replace(
  /window\.DEPLOYMENT_ID = '[^']*';/,
  `window.DEPLOYMENT_ID = '${gitCommit}';`
);
indexContent = indexContent.replace(
  /window\.GIT_COMMIT = '[^']*';/,
  `window.GIT_COMMIT = '${gitCommit}';`
);

fs.writeFileSync(indexPath, indexContent);
console.log(`✅ Updated index.html with version info`);

// Update VersionInfo component
const versionInfoPath = path.join(__dirname, '..', 'src', 'components', 'VersionInfo.tsx');
let versionInfoContent = fs.readFileSync(versionInfoPath, 'utf8');

// Update default values in the component
versionInfoContent = versionInfoContent.replace(
  /appVersion: window\.APP_VERSION \|\| '[^']*',/,
  `appVersion: window.APP_VERSION || '${appVersion}',`
);
versionInfoContent = versionInfoContent.replace(
  /buildDate: window\.BUILD_DATE \|\| '[^']*',/,
  `buildDate: window.BUILD_DATE || '${buildDate}',`
);
versionInfoContent = versionInfoContent.replace(
  /deploymentId: window\.DEPLOYMENT_ID \|\| '[^']*',/,
  `deploymentId: window.DEPLOYMENT_ID || '${gitCommit}',`
);
versionInfoContent = versionInfoContent.replace(
  /gitCommit: window\.GIT_COMMIT \|\| '[^']*',/,
  `gitCommit: window.GIT_COMMIT || '${gitCommit}',`
);

fs.writeFileSync(versionInfoPath, versionInfoContent);
console.log(`✅ Updated VersionInfo component with version info`);

console.log(`🎉 Version update complete!`);
console.log(`📱 You can now check the version in Chrome DevTools:`);
console.log(`   - Elements tab: Look for meta tags with app-version, build-date, deployment-id`);
console.log(`   - Console tab: Type 'window.APP_VERSION' or 'window.DEPLOYMENT_ID'`);
console.log(`   - Visual indicator: Small version badge in bottom-right corner`);
