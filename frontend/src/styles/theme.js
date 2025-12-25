/**
 * 🎨 BrainForge Theme System
 * 
 * WHY A THEME FILE?
 * -----------------
 * Instead of hardcoding colors like '#1a1a2e' everywhere, we define them ONCE here.
 * Benefits:
 * 1. Easy to change colors app-wide (just change here)
 * 2. Consistent look across all components
 * 3. Professional code organization
 * 4. Easy to add dark/light mode toggle later
 * 
 * CYBERPUNK COLOR THEORY:
 * ----------------------
 * - Dark backgrounds (near-black blues) = futuristic, techy
 * - Neon accents (cyan, purple, green) = energy, excitement
 * - High contrast = readability, modern feel
 * - Glow effects = cyberpunk signature look
 */

export const theme = {
  // 🌑 BACKGROUND COLORS (darkest to lightest)
  colors: {
    // Main backgrounds - deep space blues
    bgPrimary: '#0a0a0f',      // Darkest - main background
    bgSecondary: '#12121a',    // Cards, containers
    bgTertiary: '#1a1a2e',     // Hover states, elevated elements
    bgGlass: 'rgba(18, 18, 26, 0.8)', // Glassmorphism effect
    
    // 🟣 NEON ACCENT COLORS
    neonPurple: '#a855f7',     // Primary brand color
    neonPurpleGlow: '#a855f7aa', // For shadows/glows
    neonCyan: '#06b6d4',       // Secondary accent
    neonCyanGlow: '#06b6d4aa',
    neonGreen: '#22c55e',      // Success states
    neonGreenGlow: '#22c55eaa',
    neonPink: '#ec4899',       // Highlights
    neonOrange: '#f97316',     // Warnings
    neonRed: '#ef4444',        // Errors
    
    // 📝 TEXT COLORS
    textPrimary: '#ffffff',    // Main text
    textSecondary: '#a1a1aa',  // Muted text
    textMuted: '#71717a',      // Very muted
    
    // 🎯 GAME-SPECIFIC COLORS
    xpGold: '#fbbf24',         // XP and rewards
    streakFire: '#f97316',     // Streak counter
    levelUp: '#a855f7',        // Level up effects
  },
  
  // 📐 SPACING SYSTEM (consistent spacing)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },
  
  // 🔤 TYPOGRAPHY
  fonts: {
    primary: "'Orbitron', 'Rajdhani', sans-serif",  // Futuristic headings
    secondary: "'Rajdhani', 'Segoe UI', sans-serif", // Body text
    mono: "'Fira Code', 'Courier New', monospace",   // Numbers, code
  },
  
  // ⭕ BORDER RADIUS
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',  // Pill shape
  },
  
  // ✨ SHADOWS & GLOWS
  shadows: {
    // Neon glow effects - key to cyberpunk look!
    neonPurple: '0 0 20px #a855f755, 0 0 40px #a855f733',
    neonCyan: '0 0 20px #06b6d455, 0 0 40px #06b6d433',
    neonGreen: '0 0 20px #22c55e55, 0 0 40px #22c55e33',
    // Subtle elevation shadows
    card: '0 4px 20px rgba(0, 0, 0, 0.5)',
    cardHover: '0 8px 30px rgba(0, 0, 0, 0.7)',
  },
  
  // 🎬 ANIMATIONS
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
    bounce: '0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // 📱 BREAKPOINTS (responsive design)
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
};

/**
 * 🌟 GRADIENT PRESETS
 * Gradients add depth and visual interest
 */
export const gradients = {
  // Main brand gradient
  primary: `linear-gradient(135deg, ${theme.colors.neonPurple} 0%, ${theme.colors.neonCyan} 100%)`,
  // Darker version for backgrounds
  primaryDark: `linear-gradient(135deg, ${theme.colors.neonPurple}33 0%, ${theme.colors.neonCyan}33 100%)`,
  // Text gradient (for special headings)
  text: `linear-gradient(90deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan}, ${theme.colors.neonGreen})`,
  // Card hover effect
  cardHover: `linear-gradient(135deg, ${theme.colors.bgTertiary} 0%, ${theme.colors.bgSecondary} 100%)`,
};

/**
 * 🎮 GAME DIFFICULTY COLORS
 * Visual feedback for difficulty levels
 */
export const difficultyColors = {
  easy: theme.colors.neonGreen,
  medium: theme.colors.neonCyan,
  hard: theme.colors.neonOrange,
  expert: theme.colors.neonPurple,
  master: theme.colors.neonPink,
};

export default theme;
