/**
 * ⏳ LOADING SPINNER - BrainForge
 * 
 * A cyberpunk-styled loading indicator with brain icon and neon glow.
 */

import { theme } from '../styles/theme';

const LoadingSpinner = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinnerWrapper}>
        <div className="brain-spinner"></div>
        <span style={styles.brainIcon}>🧠</span>
      </div>
      <p style={styles.text}>Loading...</p>
      <style>{spinnerStyles}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    minHeight: '50vh',
  },
  spinnerWrapper: {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainIcon: {
    fontSize: '2.5rem',
    position: 'absolute',
    animation: 'pulse 1s ease-in-out infinite',
  },
  text: {
    marginTop: '1.5rem',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.secondary,
    fontSize: '1rem',
    letterSpacing: '0.1em',
  },
};

// CSS animation as a string
const spinnerStyles = `
  .brain-spinner {
    width: 80px;
    height: 80px;
    border: 3px solid transparent;
    border-top: 3px solid ${theme.colors.neonPurple};
    border-right: 3px solid ${theme.colors.neonCyan};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 
      0 0 20px ${theme.colors.neonPurple}44,
      inset 0 0 20px ${theme.colors.neonCyan}22;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      filter: drop-shadow(0 0 10px ${theme.colors.neonPurple}55);
    }
    50% { 
      transform: scale(1.1);
      filter: drop-shadow(0 0 20px ${theme.colors.neonPurple});
    }
  }
`;

export default LoadingSpinner;
