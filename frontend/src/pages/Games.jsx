/**
 * 🎮 GAMES PAGE - BrainForge
 * 
 * Lists all available brain training games.
 * Each game card links to the actual game.
 */

import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';

const Games = () => {
  // Available games data
  const games = [
    {
      id: 'math-sprint',
      name: 'Math Sprint',
      icon: '🔢',
      description: 'Race against time to solve arithmetic equations. Test your mental math speed and accuracy!',
      difficulty: 'Easy → Hard',
      difficultyColor: theme.colors.neonGreen,
      category: 'Mathematics',
      sparksReward: '10-50 ⚡',
      available: true,
    },
    {
      id: 'pattern-master',
      name: 'Pattern Master',
      icon: '🔷',
      description: 'Identify the next element in number or shape sequences. Train your pattern recognition.',
      difficulty: 'Medium',
      difficultyColor: theme.colors.neonCyan,
      category: 'Logic',
      sparksReward: '15-60 ⚡',
      available: false, // Coming soon
    },
    {
      id: 'memory-matrix',
      name: 'Memory Matrix',
      icon: '🧩',
      description: 'Remember and reproduce patterns on a grid. Challenge your visual memory.',
      difficulty: 'Medium → Expert',
      difficultyColor: theme.colors.neonPurple,
      category: 'Memory',
      sparksReward: '20-80 ⚡',
      available: true,
    },
    {
      id: 'word-logic',
      name: 'Word Logic',
      icon: '📝',
      description: 'Solve word puzzles and logical deductions. Expand your vocabulary and reasoning.',
      difficulty: 'Hard',
      difficultyColor: theme.colors.neonOrange,
      category: 'Language',
      sparksReward: '25-100 ⚡',
      available: true,
    },
    {
      id: 'dual-n-back',
      name: 'Dual N-Back',
      icon: '🧠',
      description: 'The gold standard for working memory training. Track visual positions AND audio letters simultaneously!',
      difficulty: 'Expert',
      difficultyColor: theme.colors.neonPurple,
      category: 'Working Memory',
      sparksReward: '30-150 ⚡',
      available: true,
    },
    {
      id: 'stroop-task',
      name: 'Stroop Task',
      icon: '🎨',
      description: 'Name the color of the text, not the word itself. Train your inhibitory control!',
      difficulty: 'Medium → Hard',
      difficultyColor: theme.colors.neonCyan,
      category: 'Inhibitory Control',
      sparksReward: '20-90 ⚡',
      available: true,
    },
    {
      id: 'task-switching',
      name: 'Task Switching',
      icon: '🔄',
      description: 'Rapidly switch between different mental rules. Train your cognitive flexibility!',
      difficulty: 'Hard',
      difficultyColor: theme.colors.neonOrange,
      category: 'Cognitive Flexibility',
      sparksReward: '25-120 ⚡',
      available: true,
    },
    {
      id: 'tower-of-hanoi',
      name: 'Tower of Hanoi',
      icon: '🗼',
      description: 'The legendary puzzle! Move all disks to the target tower using strategic planning.',
      difficulty: 'Medium → Expert',
      difficultyColor: theme.colors.neonPurple,
      category: 'Problem Solving',
      sparksReward: '30-200 ⚡',
      available: true,
    },
    {
      id: 'speed-sort',
      name: 'Speed Sort',
      icon: '⚡',
      description: 'Quickly sort numbers, colors, or shapes. Test your reaction time and decision making.',
      difficulty: 'Easy → Medium',
      difficultyColor: theme.colors.neonGreen,
      category: 'Speed',
      sparksReward: '10-40 ⚡',
      available: false,
    },
    {
      id: 'focus-finder',
      name: 'Focus Finder',
      icon: '🎯',
      description: 'Find hidden objects or differences. Sharpen your attention and concentration.',
      difficulty: 'Medium',
      difficultyColor: theme.colors.neonCyan,
      category: 'Attention',
      sparksReward: '15-55 ⚡',
      available: false,
    },
  ];

  // Group games by availability
  const availableGames = games.filter(g => g.available);
  const comingSoonGames = games.filter(g => !g.available);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>🎮</span>
          Brain Games
        </h1>
        <p style={styles.subtitle}>
          Choose a game to start training your brain. Complete challenges to earn Sparks and level up!
        </p>
      </header>

      {/* Available Games */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionBadge}>PLAY NOW</span>
          Available Games
        </h2>
        <div style={styles.gamesGrid}>
          {availableGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Coming Soon Games */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <span style={{ ...styles.sectionBadge, background: theme.colors.bgTertiary }}>
            COMING SOON
          </span>
          More Games
        </h2>
        <div style={styles.gamesGrid}>
          {comingSoonGames.map((game) => (
            <GameCard key={game.id} game={game} comingSoon />
          ))}
        </div>
      </section>

      {/* Categories Legend */}
      <section style={styles.categoriesSection}>
        <h3 style={styles.categoriesTitle}>Game Categories</h3>
        <div style={styles.categories}>
          {['Mathematics', 'Logic', 'Memory', 'Language', 'Speed', 'Attention'].map((cat, i) => (
            <span key={cat} style={styles.categoryTag}>{cat}</span>
          ))}
        </div>
      </section>
    </div>
  );
};

/**
 * 🎴 GAME CARD COMPONENT
 */
const GameCard = ({ game, comingSoon = false }) => {
  const CardWrapper = comingSoon ? 'div' : Link;
  const cardProps = comingSoon 
    ? { style: { ...styles.gameCard, ...styles.gameCardDisabled } }
    : { to: `/games/${game.id}`, style: styles.gameCard };

  return (
    <CardWrapper {...cardProps}>
      {/* Coming Soon Overlay */}
      {comingSoon && (
        <div style={styles.comingSoonOverlay}>
          <span style={styles.comingSoonText}>Coming Soon</span>
        </div>
      )}

      {/* Game Icon */}
      <div style={{ 
        ...styles.gameIconBg, 
        background: `${game.difficultyColor}22`,
        boxShadow: comingSoon ? 'none' : `0 0 20px ${game.difficultyColor}33`
      }}>
        <span style={styles.gameIcon}>{game.icon}</span>
      </div>

      {/* Category Tag */}
      <span style={styles.categoryLabel}>{game.category}</span>

      {/* Game Info */}
      <h3 style={styles.gameName}>{game.name}</h3>
      <p style={styles.gameDesc}>{game.description}</p>

      {/* Footer */}
      <div style={styles.gameFooter}>
        <span style={{ ...styles.difficulty, color: game.difficultyColor }}>
          {game.difficulty}
        </span>
        <span style={styles.xpReward}>
          {game.sparksReward}
        </span>
      </div>

      {/* Hover Glow */}
      {!comingSoon && (
        <div style={{ ...styles.gameGlow, background: game.difficultyColor }} />
      )}
    </CardWrapper>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },

  // Header
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '1rem',
  },
  titleIcon: {
    fontSize: '2.5rem',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: '1.1rem',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  },

  // Sections
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '1.5rem',
  },
  sectionBadge: {
    padding: '0.25rem 0.75rem',
    background: `linear-gradient(135deg, ${theme.colors.neonGreen}, ${theme.colors.neonCyan})`,
    borderRadius: theme.borderRadius.full,
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: theme.colors.bgPrimary,
  },

  // Games Grid
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },

  // Game Card
  gameCard: {
    position: 'relative',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: '1.5rem',
    textDecoration: 'none',
    border: `1px solid ${theme.colors.bgTertiary}`,
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  gameCardDisabled: {
    opacity: 0.6,
    cursor: 'default',
  },
  comingSoonOverlay: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.75rem',
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.full,
    zIndex: 2,
  },
  comingSoonText: {
    fontSize: '0.7rem',
    color: theme.colors.textMuted,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  gameIconBg: {
    width: '60px',
    height: '60px',
    borderRadius: theme.borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  gameIcon: {
    fontSize: '2rem',
  },
  categoryLabel: {
    alignSelf: 'flex-start',
    padding: '0.25rem 0.5rem',
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.sm,
    fontSize: '0.7rem',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  gameName: {
    fontSize: '1.25rem',
    fontWeight: 600,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textPrimary,
    marginBottom: '0.5rem',
  },
  gameDesc: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.5,
    flex: 1,
    marginBottom: '1rem',
  },
  gameFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: `1px solid ${theme.colors.bgTertiary}`,
  },
  difficulty: {
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  xpReward: {
    fontSize: '0.85rem',
    color: theme.colors.xpGold,
    fontWeight: 500,
  },
  gameGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },

  // Categories
  categoriesSection: {
    textAlign: 'center',
    padding: '2rem',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
  },
  categoriesTitle: {
    fontSize: '1rem',
    color: theme.colors.textMuted,
    marginBottom: '1rem',
    fontWeight: 500,
  },
  categories: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  categoryTag: {
    padding: '0.5rem 1rem',
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.full,
    fontSize: '0.85rem',
    color: theme.colors.textSecondary,
  },
};

export default Games;
