/**
 * 📝 REGISTER PAGE - BrainForge
 * 
 * New user registration with cyberpunk styling.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { theme } from '../styles/theme';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (error) setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await userAPI.register(formData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background glow effect */}
      <div style={styles.bgGlow} />
      
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconContainer}>
          <span style={styles.icon}>⚡</span>
        </div>

        <h2 style={styles.title}>Join BrainForge</h2>
        <p style={styles.subtitle}>Start your brain training journey</p>

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.success}>
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>👤</span>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Choose a username"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📧</span>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🏷️</span>
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Your display name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              style={styles.input}
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {loading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner}>⚡</span>
                Creating account...
              </span>
            ) : (
              <>🚀 Create Account</>
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login here
          </Link>
        </p>

        {/* Benefits */}
        <div style={styles.benefits}>
          <div style={styles.benefit}>
            <span>🎮</span>
            <span>Free brain games</span>
          </div>
          <div style={styles.benefit}>
            <span>📈</span>
            <span>Track progress</span>
          </div>
          <div style={styles.benefit}>
            <span>🏆</span>
            <span>Compete globally</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    position: 'relative',
  },
  bgGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: `radial-gradient(circle, ${theme.colors.neonCyan}18 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  card: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.neonCyan}33`,
    boxShadow: `0 0 40px ${theme.colors.neonCyan}11`,
    padding: '2.5rem',
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    width: '70px',
    height: '70px',
    background: `linear-gradient(135deg, ${theme.colors.neonCyan}33, ${theme.colors.neonGreen}33)`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    boxShadow: theme.shadows.neonCyan,
  },
  icon: {
    fontSize: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  error: {
    background: `${theme.colors.neonRed}22`,
    border: `1px solid ${theme.colors.neonRed}55`,
    color: theme.colors.neonRed,
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  success: {
    background: `${theme.colors.neonGreen}22`,
    border: `1px solid ${theme.colors.neonGreen}55`,
    color: theme.colors.neonGreen,
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: theme.colors.textSecondary,
    marginBottom: '0.5rem',
  },
  labelIcon: {
    fontSize: '1rem',
  },
  input: {
    padding: '0.875rem 1rem',
    background: theme.colors.bgTertiary,
    border: `1px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    color: theme.colors.textPrimary,
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  button: {
    background: `linear-gradient(135deg, ${theme.colors.neonCyan}, ${theme.colors.neonGreen})`,
    color: theme.colors.textPrimary,
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    border: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: theme.fonts.secondary,
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: theme.shadows.neonCyan,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: theme.colors.textMuted,
    fontSize: '0.9rem',
  },
  link: {
    color: theme.colors.neonCyan,
    textDecoration: 'none',
    fontWeight: 500,
  },
  benefits: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${theme.colors.bgTertiary}`,
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: theme.colors.textMuted,
    fontSize: '0.8rem',
  },
};

export default Register;
