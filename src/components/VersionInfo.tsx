import React from 'react';

interface VersionInfoProps {
  showInConsole?: boolean;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ showInConsole = true }) => {
  const versionInfo = {
    appVersion: (window as any).APP_VERSION || '1.0.0',
    buildDate: (window as any).BUILD_DATE || '2025-09-20',
    deploymentId: (window as any).DEPLOYMENT_ID || '975fa4fc3253daa7bb2e386caa26d88f1c358193',
    gitCommit: (window as any).GIT_COMMIT || '975fa4fc3253daa7bb2e386caa26d88f1c358193',
    timestamp: new Date().toISOString()
  };

  // Log version info to console for easy access
  if (showInConsole) {
    // Log version information for debugging
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '8px 12px', 
      borderRadius: '6px', 
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      opacity: 0.7,
      cursor: 'pointer'
    }} 
    onClick={() => {
      // Log full version info for debugging
      alert(`Choir Music Search v${versionInfo.appVersion}\nBuild: ${versionInfo.buildDate}\nDeploy: ${versionInfo.deploymentId}`);
    }}
    title="Click to see version info">
      v{versionInfo.appVersion} | {versionInfo.deploymentId.substring(0, 7)}
    </div>
  );
};

export default VersionInfo;
