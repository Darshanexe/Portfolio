/**
 * 🔐 LOGIN PAGE - BrainForge
 * 
 * Authentication page with cyberpunk styling.
 * Uses the theme system for consistent colors.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { theme } from '../styles/theme';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
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

    try {
      await userAPI.login(formData);
      // Redirect to home page after successful login
      navigate('/');
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.detail || 
                       err.response.data?.message || 
                       `Error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Cannot connect to server.';
      }
      
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
          <span style={styles.icon}>🧠</span>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to continue your training</p>

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
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
              placeholder="Enter your email"
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
              style={styles.input}
              placeholder="Enter your password"
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
                Logging in...
              </span>
            ) : (
              <>🚀 Login</>
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>
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
    width: '500px',
    height: '500px',
    background: `radial-gradient(circle, ${theme.colors.neonPurple}22 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  card: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.neonPurple}33`,
    boxShadow: `0 0 40px ${theme.colors.neonPurple}11`,
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    width: '70px',
    height: '70px',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}33, ${theme.colors.neonCyan}33)`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    boxShadow: theme.shadows.neonPurple,
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
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    border: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: theme.fonts.secondary,
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: theme.shadows.neonPurple,
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
};

export default Login;
