// One.com FTP Configuration
// Copy this file to onecom.config.js and update with your credentials

module.exports = {
  // FTP Connection Details
  host: 'ftp.your-domain.com',           // Your one.com FTP host
  user: 'your-ftp-username',              // Your one.com FTP username
  password: 'your-ftp-password',          // Your one.com FTP password
  
  // Deployment Settings
  localRoot: './dist',                    // Local build folder
  remoteRoot: '/public_html',             // Remote folder on one.com
  include: ['*', '**/*'],                 // Files to include
  exclude: [                              // Files to exclude
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '.git',
    '.gitignore',
    'node_modules',
    'src',
    'public'
  ],
  
  // FTP Settings
  deleteRemote: false,                    // Don't delete remote files
  forcePasv: true,                       // Use passive mode
  port: 21,                              // FTP port
  
  // Logging
  log: console.log,                      // Log function
  
  // Security
  secure: false,                          // Use FTP (not FTPS)
  secureOptions: null,                    // SSL options
  
  // Timeouts
  timeout: 30000,                        // Connection timeout (30s)
  
  // Retry settings
  retries: 3,                            // Number of retries
  retryDelay: 1000                       // Delay between retries (1s)
};
