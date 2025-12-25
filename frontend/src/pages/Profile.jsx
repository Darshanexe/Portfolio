/**
 * 👤 PROFILE PAGE - BrainForge
 * 
 * User profile with game stats and settings.
 * Will display XP, level, achievements later.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { theme } from '../styles/theme';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      setUser(data);
      setFullName(data.full_name);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await userAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      // Use defaults if stats fail
      setStats({
        sparks: 0,
        brain_level: 1,
        synapse_streak: 0,
        mind_rating: 0,
        total_games_played: 0,
        best_synapse_streak: 0,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const updated = await userAPI.updateProfile(fullName);
      setUser(updated);
      setEditing(false);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Failed to update profile.';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete your account? This cannot be undone!')) {
      try {
        await userAPI.deleteAccount();
        userAPI.logout();
        navigate('/');
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
                            err.message || 
                            'Failed to delete account.';
        setError(errorMessage);
      }
    }
  };

  if (loading || !stats) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div style={styles.errorPage}>Failed to load profile</div>;
  }

  // Calculate sparks to next level
  const calculateSparksToNext = (level) => {
    let total = 0;
    let increment = 100;
    for (let i = 1; i <= level; i++) {
      total += increment;
      increment += 50;
    }
    return total;
  };

  const sparksToNext = calculateSparksToNext(stats.brain_level + 1) - stats.sparks;

  return (
    <div style={styles.container}>
      {/* Profile Header Card */}
      <div style={styles.headerCard}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            <span style={styles.avatarEmoji}>🧠</span>
            <div style={styles.levelBadge}>{stats.brain_level}</div>
          </div>
          <div style={styles.userInfo}>
            <h1 style={styles.userName}>{user.full_name}</h1>
            <p style={styles.userHandle}>@{user.username}</p>
            <p style={styles.memberSince}>
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Sparks Progress Bar */}
        <div style={styles.xpSection}>
          <div style={styles.xpHeader}>
            <span style={styles.xpLabel}>Brain Level {stats.brain_level}</span>
            <span style={styles.xpValue}>{stats.sparks} / {stats.sparks + sparksToNext} ⚡ Sparks</span>
          </div>
          <div style={styles.xpBarBg}>
            <div 
              style={{
                ...styles.xpBarFill,
                width: `${(stats.sparks / (stats.sparks + sparksToNext)) * 100}%`
              }}
            />
          </div>
        </div>

        {!editing && (
          <button onClick={() => setEditing(true)} style={styles.editBtn}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard 
          icon="🎮" 
          value={stats.total_games_played} 
          label="Games Played" 
          color={theme.colors.neonCyan}
        />
        <StatCard 
          icon="🔥" 
          value={stats.synapse_streak} 
          label="Synapse Streak" 
          color={theme.colors.neonOrange}
        />
        <StatCard 
          icon="🧠" 
          value={stats.mind_rating.toLocaleString()} 
          label="Mind Rating" 
          color={theme.colors.neonPurple}
        />
        <StatCard 
          icon={user.is_active ? "✅" : "❌"} 
          value={user.is_active ? "Active" : "Inactive"} 
          label="Account Status" 
          color={user.is_active ? theme.colors.neonGreen : theme.colors.neonRed}
        />
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div style={styles.editCard}>
          <h3 style={styles.editTitle}>Edit Profile</h3>
          <form onSubmit={handleUpdate} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span>🏷️</span> Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formInfo}>
              <div style={styles.formInfoItem}>
                <span style={styles.formInfoLabel}>Email</span>
                <span style={styles.formInfoValue}>{user.email}</span>
              </div>
              <div style={styles.formInfoItem}>
                <span style={styles.formInfoLabel}>Username</span>
                <span style={styles.formInfoValue}>@{user.username}</span>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.saveBtn}>
                💾 Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFullName(user.full_name);
                  setError('');
                }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Settings */}
      <div style={styles.settingsCard}>
        <h3 style={styles.settingsTitle}>⚙️ Account Settings</h3>
        
        <div style={styles.dangerZone}>
          <div style={styles.dangerContent}>
            <h4 style={styles.dangerTitle}>⚠️ Danger Zone</h4>
            <p style={styles.dangerText}>
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button onClick={handleDelete} style={styles.deleteBtn}>
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 📊 STAT CARD COMPONENT
 */
const StatCard = ({ icon, value, label, color }) => (
  <div style={styles.statCard}>
    <span style={styles.statIcon}>{icon}</span>
    <span style={{ ...styles.statValue, color }}>{value}</span>
    <span style={styles.statLabel}>{label}</span>
  </div>
);

const styles = {
  container: {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  errorPage: {
    color: theme.colors.neonRed,
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.25rem',
  },

  // Header Card
  headerCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.neonPurple}33`,
    padding: '2rem',
    marginBottom: '1.5rem',
    position: 'relative',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  avatar: {
    position: 'relative',
    width: '100px',
    height: '100px',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}44, ${theme.colors.neonCyan}44)`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows.neonPurple,
  },
  avatarEmoji: {
    fontSize: '3rem',
  },
  levelBadge: {
    position: 'absolute',
    bottom: '-5px',
    right: '-5px',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    fontSize: '0.9rem',
    border: `3px solid ${theme.colors.bgSecondary}`,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '0.25rem',
  },
  userHandle: {
    color: theme.colors.neonCyan,
    fontSize: '1rem',
    marginBottom: '0.25rem',
  },
  memberSince: {
    color: theme.colors.textMuted,
    fontSize: '0.875rem',
  },

  // XP Bar
  xpSection: {
    marginBottom: '1rem',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  xpLabel: {
    color: theme.colors.textSecondary,
    fontSize: '0.875rem',
  },
  xpValue: {
    color: theme.colors.xpGold,
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  xpBarBg: {
    height: '8px',
    background: theme.colors.bgTertiary,
    borderRadius: '4px',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.colors.neonPurple}, ${theme.colors.xpGold})`,
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },

  editBtn: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    padding: '0.5rem 1rem',
    background: theme.colors.bgTertiary,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.textMuted}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontFamily: theme.fonts.secondary,
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    textAlign: 'center',
    border: `1px solid ${theme.colors.bgTertiary}`,
  },
  statIcon: {
    fontSize: '1.5rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    display: 'block',
    marginBottom: '0.25rem',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  // Error Box
  errorBox: {
    background: `${theme.colors.neonRed}22`,
    border: `1px solid ${theme.colors.neonRed}55`,
    color: theme.colors.neonRed,
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  // Edit Card
  editCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.neonCyan}33`,
    padding: '2rem',
    marginBottom: '1.5rem',
  },
  editTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: theme.colors.textSecondary,
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.875rem 1rem',
    background: theme.colors.bgTertiary,
    border: `1px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    color: theme.colors.textPrimary,
    outline: 'none',
  },
  formInfo: {
    display: 'flex',
    gap: '2rem',
    padding: '1rem',
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.md,
  },
  formInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  formInfoLabel: {
    color: theme.colors.textMuted,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
  },
  formInfoValue: {
    color: theme.colors.textSecondary,
    fontSize: '0.9rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
  },
  saveBtn: {
    flex: 1,
    padding: '0.875rem',
    background: `linear-gradient(135deg, ${theme.colors.neonCyan}, ${theme.colors.neonGreen})`,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: theme.fonts.secondary,
  },
  cancelBtn: {
    padding: '0.875rem 1.5rem',
    background: 'transparent',
    color: theme.colors.textMuted,
    border: `1px solid ${theme.colors.textMuted}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontFamily: theme.fonts.secondary,
  },

  // Settings Card
  settingsCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.bgTertiary}`,
    padding: '2rem',
  },
  settingsTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '1.5rem',
  },
  dangerZone: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: `${theme.colors.neonRed}11`,
    border: `1px solid ${theme.colors.neonRed}33`,
    borderRadius: theme.borderRadius.lg,
  },
  dangerContent: {
    flex: 1,
  },
  dangerTitle: {
    color: theme.colors.neonRed,
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  dangerText: {
    color: theme.colors.textMuted,
    fontSize: '0.875rem',
  },
  deleteBtn: {
    padding: '0.75rem 1.5rem',
    background: theme.colors.neonRed,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: theme.fonts.secondary,
    transition: 'all 0.3s ease',
  },
};

export default Profile;
