/**
 * 🏆 LEADERBOARD PAGE - BrainForge
 * 
 * Shows top players ranked by Mind Rating
 */

import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { theme } from '../styles/theme';
import LoadingSpinner from '../components/LoadingSpinner';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await userAPI.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return theme.colors.neonGold || '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return theme.colors.textSecondary;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>🏆</span>
          Leaderboard
        </h1>
        <p style={styles.subtitle}>
          Top players ranked by Mind Rating. Compete to reach the top!
        </p>
      </header>

      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Leaderboard Table */}
      <div style={styles.leaderboardCard}>
        {leaderboard.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎮</div>
            <div style={styles.emptyText}>
              No players yet! Be the first to play and claim the top spot.
            </div>
          </div>
        ) : (
          <div style={styles.table}>
            {/* Header Row */}
            <div style={styles.tableHeader}>
              <div style={styles.headerCell}>Rank</div>
              <div style={styles.headerCellPlayer}>Player</div>
              <div style={styles.headerCell}>Brain Level</div>
              <div style={styles.headerCell}>Mind Rating</div>
              <div style={styles.headerCell}>Sparks</div>
            </div>

            {/* Data Rows */}
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.rank} 
                style={{
                  ...styles.tableRow,
                  ...(index < 3 ? styles.topThreeRow : {})
                }}
              >
                <div style={{ ...styles.rankCell, color: getRankColor(entry.rank) }}>
                  {getRankMedal(entry.rank)}
                </div>
                <div style={styles.playerCell}>
                  <div style={styles.playerAvatar}>
                    {entry.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span style={styles.playerName}>{entry.username}</span>
                </div>
                <div style={styles.dataCell}>
                  <span style={styles.levelBadge}>{entry.brain_level}</span>
                </div>
                <div style={styles.dataCell}>
                  <span style={styles.mindRating}>
                    🧠 {entry.mind_rating.toLocaleString()}
                  </span>
                </div>
                <div style={styles.dataCell}>
                  <span style={styles.sparks}>
                    ⚡ {entry.sparks.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🧠</div>
          <div style={styles.infoTitle}>Mind Rating</div>
          <div style={styles.infoDesc}>
            Your overall performance score based on game results and accuracy
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>⚡</div>
          <div style={styles.infoTitle}>Sparks</div>
          <div style={styles.infoDesc}>
            Earned by playing games. Used to level up your Brain Level
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🔥</div>
          <div style={styles.infoTitle}>Synapse Streak</div>
          <div style={styles.infoDesc}>
            Train daily to build your streak and earn bonus rewards
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '3rem',
    fontFamily: theme.fonts.heading,
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  titleIcon: {
    fontSize: '3rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: theme.borderRadius.lg,
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    color: '#ef4444',
  },
  leaderboardCard: {
    background: `linear-gradient(135deg, ${theme.colors.bgSecondary}ee, ${theme.colors.bgTertiary}dd)`,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.neonPurple}33`,
    boxShadow: `0 0 40px ${theme.colors.neonPurple}22`,
    padding: '2rem',
    marginBottom: '3rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: theme.colors.textSecondary,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 120px 150px 120px',
    padding: '1rem',
    borderBottom: `2px solid ${theme.colors.neonPurple}44`,
    marginBottom: '0.5rem',
  },
  headerCell: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: theme.fonts.heading,
  },
  headerCellPlayer: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: theme.fonts.heading,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 120px 150px 120px',
    padding: '1rem',
    background: 'rgba(15, 15, 35, 0.5)',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
  },
  topThreeRow: {
    background: `linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(6, 182, 212, 0.05))`,
    border: `1px solid ${theme.colors.neonPurple}33`,
  },
  rankCell: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
    textAlign: 'center',
  },
  playerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  playerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.heading,
    border: `2px solid ${theme.colors.neonPurple}`,
  },
  playerName: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
  },
  dataCell: {
    display: 'flex',
    justifyContent: 'center',
  },
  levelBadge: {
    padding: '0.3rem 0.8rem',
    background: `${theme.colors.neonCyan}22`,
    border: `1px solid ${theme.colors.neonCyan}66`,
    borderRadius: theme.borderRadius.full,
    fontSize: '0.9rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonCyan,
  },
  mindRating: {
    fontSize: '1rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonPurple,
  },
  sparks: {
    fontSize: '1rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonGreen,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  infoCard: {
    background: `linear-gradient(135deg, ${theme.colors.bgSecondary}, ${theme.colors.bgTertiary})`,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    border: `1px solid ${theme.colors.neonPurple}22`,
    textAlign: 'center',
  },
  infoIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  infoTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.heading,
    color: theme.colors.textPrimary,
    marginBottom: '0.5rem',
  },
  infoDesc: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.5,
  },
};

export default Leaderboard;
