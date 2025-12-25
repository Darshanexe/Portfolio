/**
 * 🧠 INTERACTIVE BRAIN COMPONENT
 * 
 * Animated brain with fun hover effects and rotating tips!
 */

import { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

// Brain tips that show on hover
const BRAIN_TIPS = [
  { emoji: '💡', tip: 'Your brain uses 20% of your body\'s energy!' },
  { emoji: '🧬', tip: 'You have about 86 billion neurons!' },
  { emoji: '⚡', tip: 'Brain signals travel at 268 mph!' },
  { emoji: '💭', tip: 'You generate 70,000 thoughts per day!' },
  { emoji: '🌊', tip: 'Your brain is 73% water - stay hydrated!' },
  { emoji: '😴', tip: 'Sleep helps consolidate memories!' },
  { emoji: '🏃', tip: 'Exercise boosts brain cell growth!' },
  { emoji: '🎮', tip: 'Gaming improves cognitive flexibility!' },
  { emoji: '🧘', tip: 'Meditation increases gray matter!' },
  { emoji: '📚', tip: 'Learning creates new neural pathways!' },
  { emoji: '🎵', tip: 'Music activates multiple brain regions!' },
  { emoji: '🥜', tip: 'Omega-3s improve brain function!' },
];

// Fun reactions when hovering
const HOVER_REACTIONS = [
  { scale: 1.15, rotate: -5, message: 'Hey there! 👋' },
  { scale: 1.2, rotate: 5, message: 'Ticklish! 🤭' },
  { scale: 1.1, rotate: -3, message: 'Big brain time! 🧠' },
  { scale: 1.25, rotate: 8, message: 'Woah! 😮' },
  { scale: 1.15, rotate: -8, message: 'Keep training! 💪' },
  { scale: 1.2, rotate: 0, message: '*happy brain noises* 🎉' },
  { scale: 1.1, rotate: 10, message: 'Ready to play? 🎮' },
  { scale: 1.18, rotate: -6, message: 'Let\'s get smarter! 📈' },
];

const Brain3D = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [reaction, setReaction] = useState(HOVER_REACTIONS[0]);
  const [hoverCount, setHoverCount] = useState(0);

  // Change tip every 4 seconds when hovered
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % BRAIN_TIPS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Pick a random reaction
    const randomReaction = HOVER_REACTIONS[Math.floor(Math.random() * HOVER_REACTIONS.length)];
    setReaction(randomReaction);
    // Pick a random tip
    setCurrentTip(Math.floor(Math.random() * BRAIN_TIPS.length));
    setHoverCount(prev => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    brainWrapper: {
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: isHovered 
        ? `scale(${reaction.scale}) rotate(${reaction.rotate}deg)` 
        : 'scale(1) rotate(0deg)',
    },
    brainIcon: {
      fontSize: '10rem',
      animation: isHovered ? 'none' : 'float 3s ease-in-out infinite',
      filter: isHovered 
        ? 'drop-shadow(0 0 60px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 100px rgba(6, 182, 212, 0.4))'
        : 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.5))',
      transition: 'filter 0.3s ease',
      userSelect: 'none',
    },
    // Speech bubble that appears on hover
    speechBubble: {
      position: 'absolute',
      top: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(15, 15, 35, 0.95)',
      border: `2px solid ${theme.colors.neonPurple}`,
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '0.9rem',
      fontFamily: theme.fonts.heading,
      color: theme.colors.neonCyan,
      whiteSpace: 'nowrap',
      opacity: isHovered ? 1 : 0,
      transition: 'all 0.3s ease',
      pointerEvents: 'none',
      boxShadow: `0 0 20px ${theme.colors.neonPurple}40`,
    },
    // Tip card that shows below
    tipCard: {
      marginTop: '1.5rem',
      padding: '16px 24px',
      background: isHovered 
        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(6, 182, 212, 0.1))'
        : 'transparent',
      border: isHovered 
        ? `1px solid ${theme.colors.neonPurple}50`
        : '1px solid transparent',
      borderRadius: '16px',
      textAlign: 'center',
      transition: 'all 0.4s ease',
      minHeight: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '320px',
    },
    tipEmoji: {
      fontSize: '2rem',
      marginBottom: '8px',
      opacity: isHovered ? 1 : 0,
      transform: isHovered ? 'scale(1)' : 'scale(0.5)',
      transition: 'all 0.3s ease 0.1s',
    },
    tipText: {
      fontSize: '0.95rem',
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.body,
      lineHeight: 1.5,
      opacity: isHovered ? 1 : 0,
      transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.3s ease 0.15s',
    },
    tagline: {
      fontSize: '1.1rem',
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.heading,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      opacity: isHovered ? 0 : 1,
      position: 'absolute',
      bottom: '0',
      transition: 'opacity 0.3s ease',
    },
    // Sparkles around brain when hovered
    sparkle: {
      position: 'absolute',
      fontSize: '1.5rem',
      opacity: isHovered ? 1 : 0,
      transition: 'all 0.3s ease',
      animation: isHovered ? 'sparkle 1s ease-in-out infinite' : 'none',
    },
    hoverHint: {
      position: 'absolute',
      bottom: '-10px',
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
      opacity: isHovered ? 0 : 0.6,
      transition: 'opacity 0.3s ease',
    },
  };

  // Add sparkle animation via style tag
  const sparkleKeyframes = `
    @keyframes sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 0.7; }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{sparkleKeyframes}</style>
      
      <div 
        style={styles.brainWrapper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Speech bubble */}
        <div style={styles.speechBubble}>
          {reaction.message}
        </div>

        {/* Sparkles */}
        <span style={{ ...styles.sparkle, top: '10%', left: '0%' }}>✨</span>
        <span style={{ ...styles.sparkle, top: '0%', right: '10%', animationDelay: '0.2s' }}>⭐</span>
        <span style={{ ...styles.sparkle, bottom: '20%', left: '-5%', animationDelay: '0.4s' }}>💫</span>
        <span style={{ ...styles.sparkle, bottom: '10%', right: '0%', animationDelay: '0.6s' }}>✨</span>

        {/* Brain emoji */}
        <div style={styles.brainIcon}>🧠</div>
      </div>

      {/* Tip card */}
      <div style={styles.tipCard}>
        {isHovered ? (
          <>
            <div style={styles.tipEmoji}>{BRAIN_TIPS[currentTip].emoji}</div>
            <div style={styles.tipText}>{BRAIN_TIPS[currentTip].tip}</div>
          </>
        ) : (
          <div style={styles.tagline}>Train Your Mind</div>
        )}
      </div>
    </div>
  );
};

export default Brain3D;
