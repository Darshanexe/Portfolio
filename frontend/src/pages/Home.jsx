/**
 * 🏠 HOME PAGE - BrainForge Dashboard
 * 
 * This is the landing page that users see first.
 * It showcases the platform and encourages users to start playing.
 * 
 * DESIGN CONCEPTS:
 * - Hero section with animated gradient text
 * - Stats cards showing platform metrics
 * - Brain tips rotating carousel
 * - Game cards with hover effects
 * - Call-to-action buttons
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { userAPI } from '../services/api';
import { theme, gradients } from '../styles/theme';
import Brain3D from '../components/Brain3D';

const Home = () => {
  const isAuthenticated = authUtils.isAuthenticated();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    active_players: '...',
    games_played: '...',
    sparks_earned: '...',
  });
  const [userStats, setUserStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);

  // Fetch platform stats (public, always shown)
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const stats = await userAPI.getPlatformStats();
        setPlatformStats(stats);
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
      }
    };
    fetchPlatformStats();
  }, []);

  // Fetch user-specific data if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const [stats, games] = await Promise.all([
            userAPI.getStats(),
            userAPI.getGameHistory(null, 5), // last 5 games
          ]);
          setUserStats(stats);
          setRecentGames(games);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      };
      fetchUserData();
    }
  }, [isAuthenticated]);

  // 🧠 Brain Tips & Neuroscience Facts
  const brainTips = [
    {
      icon: '🔬',
      category: 'Neuroscience',
      title: 'Neurons That Fire Together, Wire Together',
      description: 'When you practice a skill repeatedly, the neural pathways strengthen through a process called synaptic plasticity. This is how habits and skills form!',
    },
    {
      icon: '😴',
      category: 'Brain Health',
      title: 'Sleep Consolidates Memory',
      description: 'During deep sleep, your brain replays and strengthens memories from the day. Getting 7-9 hours of sleep is essential for learning.',
    },
    {
      icon: '🏃',
      category: 'Brain Health',
      title: 'Exercise Grows New Neurons',
      description: 'Physical exercise increases BDNF (Brain-Derived Neurotrophic Factor), which promotes the growth of new neurons in the hippocampus.',
    },
    {
      icon: '🧩',
      category: 'Training Tip',
      title: 'Challenge Creates Growth',
      description: 'Your brain grows when challenged just beyond your current ability. This "desirable difficulty" is key to cognitive improvement.',
    },
    {
      icon: '🎯',
      category: 'Training Tip',
      title: 'Consistency Beats Intensity',
      description: '15 minutes of daily brain training is more effective than 2 hours once a week. Regular practice builds stronger neural pathways.',
    },
    {
      icon: '🥗',
      category: 'Brain Health',
      title: 'Feed Your Brain',
      description: 'Omega-3 fatty acids, blueberries, and dark chocolate support brain health. Your brain uses 20% of your daily calories!',
    },
    {
      icon: '💧',
      category: 'Brain Health',
      title: 'Hydration Matters',
      description: 'Even 2% dehydration can impair cognitive function. Drink water regularly to keep your brain performing at its best.',
    },
    {
      icon: '🧘',
      category: 'Training Tip',
      title: 'Meditation Changes Your Brain',
      description: 'Just 8 weeks of regular meditation can increase gray matter in areas related to memory, learning, and emotional regulation.',
    },
  ];

  // Rotate tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % brainTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [brainTips.length]);

  // Sample featured games data (will come from backend later)
  const featuredGames = [
    {
      id: 'math-sprint',
      name: 'Math Sprint',
      icon: '🔢',
      description: 'Race against time solving equations',
      difficulty: 'Easy',
      color: theme.colors.neonGreen,
    },
    {
      id: 'pattern-master',
      name: 'Pattern Master',
      icon: '🔷',
      description: 'Find the hidden patterns',
      difficulty: 'Medium',
      color: theme.colors.neonCyan,
    },
    {
      id: 'memory-matrix',
      name: 'Memory Matrix',
      icon: '🧩',
      description: 'Test your visual memory',
      difficulty: 'Hard',
      color: theme.colors.neonPurple,
    },
  ];

  // Platform stats (real data from backend)
  const stats = [
    { label: 'Active Players', value: platformStats.active_players, icon: '👥' },
    { label: 'Games Played', value: platformStats.games_played, icon: '🎮' },
    { label: 'Sparks Earned', value: platformStats.sparks_earned, icon: '⚡' },
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        {/* Animated background glow */}
        <div style={styles.heroGlow} />
        
        <div style={styles.heroContent}>
          {/* Main Title with gradient effect */}
          <h1 style={styles.title}>
            Train Your
            <span style={styles.titleAccent}> Mind</span>
          </h1>
          
          <p style={styles.subtitle}>
            {isAuthenticated 
              ? `Welcome back! You've earned ${userStats?.sparks || 0} Sparks and reached Brain Level ${userStats?.brain_level || 1}. Ready for more challenges?`
              : 'Join thousands of players improving their cognitive abilities with science-based brain training games. Track your progress, compete on leaderboards, and level up your mind.'
            }
          </p>

          {/* Stats Row - Show platform stats for non-logged, user stats for logged-in */}
          <div style={styles.statsRow}>
            {isAuthenticated && userStats ? (
              <>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>⚡</span>
                  <span style={styles.statValue}>{userStats.sparks.toLocaleString()}</span>
                  <span style={styles.statLabel}>Your Sparks</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>🧠</span>
                  <span style={styles.statValue}>{userStats.brain_level}</span>
                  <span style={styles.statLabel}>Brain Level</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>🔥</span>
                  <span style={styles.statValue}>{userStats.synapse_streak}</span>
                  <span style={styles.statLabel}>Day Streak</span>
                </div>
              </>
            ) : (
              stats.map((stat, index) => (
                <div key={index} style={styles.statItem}>
                  <span style={styles.statIcon}>{stat.icon}</span>
                  <span style={styles.statValue}>{stat.value}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              ))
            )}
          </div>

          {/* CTA Buttons */}
          <div style={styles.ctaButtons}>
            {!isAuthenticated ? (
              <>
                <Link to="/register" style={styles.primaryBtn}>
                  <span>🚀</span> Start Training
                </Link>
                <Link to="/login" style={styles.secondaryBtn}>
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link to="/games" style={styles.primaryBtn}>
                  <span>🎮</span> Play Now
                </Link>
                <Link to="/profile" style={styles.secondaryBtn}>
                  View Profile
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 🧠 Interactive 3D Brain */}
        <div style={styles.heroVisual}>
          <Brain3D />
        </div>
      </section>

      {/* 🧠 Brain Tips Section */}
      <section style={styles.tipsSection}>
        <div style={styles.tipCard}>
          <div style={styles.tipHeader}>
            <span style={styles.tipIcon}>{brainTips[currentTipIndex].icon}</span>
            <span style={styles.tipCategory}>{brainTips[currentTipIndex].category}</span>
          </div>
          <h3 style={styles.tipTitle}>{brainTips[currentTipIndex].title}</h3>
          <p style={styles.tipDescription}>{brainTips[currentTipIndex].description}</p>
          
          {/* Tip Navigation Dots */}
          <div style={styles.tipDots}>
            {brainTips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTipIndex(index)}
                style={{
                  ...styles.tipDot,
                  ...(index === currentTipIndex ? styles.tipDotActive : {}),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 📊 User Dashboard Section (only shown when logged in) */}
      {isAuthenticated && userStats && (
        <section style={styles.dashboardSection}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>📊</span>
            Your Progress
          </h2>
          
          <div style={styles.dashboardGrid}>
            {/* User Stats Cards */}
            <div style={styles.dashboardCard}>
              <div style={styles.dashCardIcon}>⚡</div>
              <div style={styles.dashCardValue}>{userStats.sparks.toLocaleString()}</div>
              <div style={styles.dashCardLabel}>Sparks Earned</div>
            </div>
            
            <div style={styles.dashboardCard}>
              <div style={styles.dashCardIcon}>🧠</div>
              <div style={styles.dashCardValue}>{userStats.brain_level}</div>
              <div style={styles.dashCardLabel}>Brain Level</div>
            </div>
            
            <div style={styles.dashboardCard}>
              <div style={styles.dashCardIcon}>🔥</div>
              <div style={styles.dashCardValue}>{userStats.synapse_streak}</div>
              <div style={styles.dashCardLabel}>Day Streak</div>
            </div>
            
            <div style={styles.dashboardCard}>
              <div style={styles.dashCardIcon}>🎮</div>
              <div style={styles.dashCardValue}>{userStats.total_games_played}</div>
              <div style={styles.dashCardLabel}>Games Played</div>
            </div>
          </div>

          {/* Recent Games */}
          {recentGames.length > 0 && (
            <div style={styles.recentGames}>
              <h3 style={styles.recentGamesTitle}>Recent Games</h3>
              <div style={styles.recentGamesList}>
                {recentGames.map((game, index) => (
                  <div key={index} style={styles.recentGameItem}>
                    <div style={styles.recentGameIcon}>
                      {game.game_type === 'math-sprint' ? '🔢' : '🎮'}
                    </div>
                    <div style={styles.recentGameInfo}>
                      <div style={styles.recentGameName}>
                        {game.game_type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </div>
                      <div style={styles.recentGameDetails}>
                        Score: {game.score} • {game.sparks_earned}⚡ • {game.difficulty}
                      </div>
                    </div>
                    <div style={styles.recentGameAccuracy}>
                      {game.accuracy.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/profile" style={styles.viewAllBtn}>
                View Full History →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Featured Games Section */}
      <section style={styles.gamesSection}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🎯</span>
          Featured Games
        </h2>
        
        <div style={styles.gamesGrid}>
          {featuredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>✨</span>
          Why BrainForge?
        </h2>
        
        <div style={styles.featuresGrid}>
          <FeatureCard 
            icon="📈"
            title="Track Progress"
            description="Monitor your improvement with detailed analytics and performance graphs"
            color={theme.colors.neonGreen}
          />
          <FeatureCard 
            icon="🏆"
            title="Compete & Win"
            description="Challenge friends and climb the global leaderboards"
            color={theme.colors.neonCyan}
          />
          <FeatureCard 
            icon="🎖️"
            title="Earn Rewards"
            description="Unlock achievements, badges, and exclusive content"
            color={theme.colors.neonPurple}
          />
          <FeatureCard 
            icon="🧪"
            title="Science-Based"
            description="Games designed using cognitive science principles"
            color={theme.colors.neonPink}
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section style={styles.ctaBanner}>
        <h2 style={styles.ctaTitle}>Ready to Level Up Your Brain?</h2>
        <p style={styles.ctaText}>
          Join thousands of players improving their cognitive abilities every day.
        </p>
        <Link 
          to={isAuthenticated ? "/games" : "/register"} 
          style={styles.ctaBannerBtn}
        >
          {isAuthenticated ? "Start Playing" : "Create Free Account"}
        </Link>
      </section>
    </div>
  );
};

/**
 * 🎮 GAME CARD COMPONENT
 * Displays a featured game with hover effects
 */
const GameCard = ({ game }) => (
  <Link to={`/games/${game.id}`} style={styles.gameCard}>
    <div style={{ ...styles.gameIconBg, background: `${game.color}22` }}>
      <span style={styles.gameIcon}>{game.icon}</span>
    </div>
    <h3 style={styles.gameName}>{game.name}</h3>
    <p style={styles.gameDesc}>{game.description}</p>
    <div style={{ ...styles.gameDifficulty, color: game.color }}>
      {game.difficulty}
    </div>
    <div style={{ ...styles.gameGlow, background: game.color }} />
  </Link>
);

/**
 * ✨ FEATURE CARD COMPONENT
 * Displays a platform feature with icon
 */
const FeatureCard = ({ icon, title, description, color }) => (
  <div style={styles.featureCard}>
    <div style={{ ...styles.featureIcon, background: `${color}22`, color }}>
      {icon}
    </div>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{description}</p>
  </div>
);

/**
 * 🎨 STYLES
 */
const styles = {
  container: {
    minHeight: '100vh',
    overflow: 'hidden',
  },

  // Hero Section
  hero: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '80vh',
    gap: '2rem',
  },
  heroGlow: {
    position: 'absolute',
    top: '50%',
    left: '30%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: `radial-gradient(circle, ${theme.colors.neonPurple}22 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  heroContent: {
    flex: 1,
    zIndex: 1,
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: 800,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    lineHeight: 1.1,
    marginBottom: '1.5rem',
  },
  titleAccent: {
    background: gradients.text,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.6,
    maxWidth: '500px',
    marginBottom: '2rem',
  },
  statsRow: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statIcon: {
    fontSize: '1.5rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.neonCyan,
    textShadow: `0 0 20px ${theme.colors.neonCyan}`,
  },
  statLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textMuted,
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    textDecoration: 'none',
    borderRadius: theme.borderRadius.lg,
    fontFamily: theme.fonts.secondary,
    fontWeight: 600,
    fontSize: '1.125rem',
    boxShadow: theme.shadows.neonPurple,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'transparent',
    color: theme.colors.textSecondary,
    textDecoration: 'none',
    borderRadius: theme.borderRadius.lg,
    fontFamily: theme.fonts.secondary,
    fontWeight: 500,
    fontSize: '1.125rem',
    border: `2px solid ${theme.colors.textMuted}`,
    transition: 'all 0.3s ease',
  },

  // Hero Visual (Brain animation)
  heroVisual: {
    position: 'relative',
    width: '720px',
    height: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Brain Tips Section
  tipsSection: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  tipCard: {
    background: `linear-gradient(135deg, ${theme.colors.bgSecondary}, ${theme.colors.bgTertiary})`,
    borderRadius: theme.borderRadius.xl,
    padding: '2rem',
    border: `1px solid ${theme.colors.neonCyan}33`,
    boxShadow: `0 0 30px ${theme.colors.neonCyan}11`,
  },
  tipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  tipIcon: {
    fontSize: '2rem',
  },
  tipCategory: {
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: theme.colors.neonCyan,
    background: `${theme.colors.neonCyan}22`,
    padding: '0.25rem 0.75rem',
    borderRadius: theme.borderRadius.full,
  },
  tipTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '0.75rem',
  },
  tipDescription: {
    fontSize: '1rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: '1.5rem',
  },
  tipDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  tipDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: theme.colors.bgTertiary,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  tipDotActive: {
    background: theme.colors.neonCyan,
    boxShadow: `0 0 10px ${theme.colors.neonCyan}`,
    transform: 'scale(1.2)',
  },

  // Dashboard Section (user-specific)
  dashboardSection: {
    padding: '4rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  dashboardCard: {
    background: theme.colors.bgPrimary,
    border: `1px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    textAlign: 'center',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
  },
  dashCardIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  dashCardValue: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonCyan,
    textShadow: `0 0 20px ${theme.colors.neonCyan}`,
    marginBottom: '0.25rem',
  },
  dashCardLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textMuted,
  },
  recentGames: {
    marginTop: '2rem',
  },
  recentGamesTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textPrimary,
    marginBottom: '1rem',
  },
  recentGamesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  recentGameItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: theme.colors.bgPrimary,
    border: `1px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.md,
    padding: '1rem',
    transition: 'border-color 0.3s ease',
  },
  recentGameIcon: {
    fontSize: '1.5rem',
  },
  recentGameInfo: {
    flex: 1,
  },
  recentGameName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '0.25rem',
  },
  recentGameDetails: {
    fontSize: '0.8rem',
    color: theme.colors.textMuted,
  },
  recentGameAccuracy: {
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonGreen,
  },
  viewAllBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    color: theme.colors.neonCyan,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'color 0.3s ease',
  },

  // Games Section
  gamesSection: {
    padding: '4rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '2rem',
  },
  sectionIcon: {
    fontSize: '1.5rem',
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  gameCard: {
    position: 'relative',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    textDecoration: 'none',
    border: `1px solid ${theme.colors.bgTertiary}`,
    transition: 'transform 0.3s ease, border-color 0.3s ease',
    overflow: 'hidden',
  },
  gameIconBg: {
    width: '60px',
    height: '60px',
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  gameIcon: {
    fontSize: '2rem',
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
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  gameDifficulty: {
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
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

  // Features Section
  featuresSection: {
    padding: '4rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: '2rem',
    textAlign: 'center',
    border: `1px solid ${theme.colors.bgTertiary}`,
    transition: 'transform 0.3s ease',
  },
  featureIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    margin: '0 auto 1rem',
  },
  featureTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '0.5rem',
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.5,
  },

  // CTA Banner
  ctaBanner: {
    background: `linear-gradient(135deg, ${theme.colors.bgSecondary}, ${theme.colors.bgTertiary})`,
    padding: '4rem 2rem',
    textAlign: 'center',
    margin: '4rem 2rem',
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.neonPurple}33`,
    boxShadow: theme.shadows.neonPurple,
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '1rem',
  },
  ctaText: {
    fontSize: '1.125rem',
    color: theme.colors.textSecondary,
    marginBottom: '2rem',
  },
  ctaBannerBtn: {
    display: 'inline-block',
    padding: '1rem 3rem',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    textDecoration: 'none',
    borderRadius: theme.borderRadius.full,
    fontFamily: theme.fonts.secondary,
    fontWeight: 600,
    fontSize: '1.125rem',
    boxShadow: theme.shadows.neonPurple,
    transition: 'transform 0.3s ease',
  },
};

export default Home;
