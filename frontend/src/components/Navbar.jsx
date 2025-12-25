/**
 * 🧭 NAVBAR COMPONENT
 * 
 * COMPONENT STRUCTURE:
 * -------------------
 * A React component is a reusable piece of UI. This Navbar will appear on every page.
 * 
 * CONCEPTS USED:
 * - useState: For mobile menu toggle
 * - useNavigate: Programmatic navigation
 * - useLocation: Get current URL path for active link highlighting
 * - Conditional rendering: Show different content based on auth state
 * - CSS-in-JS: Inline styles for component-specific styling
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { userAPI } from '../services/api';
import { theme } from '../styles/theme';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Gets current URL path
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check if user is logged in
  const isLoggedIn = authUtils.isAuthenticated();

  // Fetch user data when logged in and validate token
  useEffect(() => {
    if (isLoggedIn) {
      userAPI.getProfile()
        .then(data => setUser(data))
        .catch((error) => {
          // Token invalid or expired - logout and redirect to home
          console.log('Token validation failed, logging out');
          authUtils.removeToken();
          setUser(null);
          if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
            navigate('/');
          }
        });
    } else {
      setUser(null);
    }
  }, [isLoggedIn, location.pathname, navigate]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.full_name) return '?';
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    authUtils.removeToken();
    setUser(null);
    navigate('/');
  };

  // Check if a link is active (current page)
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      {/* Logo Section */}
      <Link to="/" style={styles.logoContainer}>
        <span style={styles.logoIcon}>🧠</span>
        <span style={styles.logoText}>
          Brain<span style={styles.logoAccent}>Forge</span>
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <div style={styles.navLinks}>
        {isLoggedIn && (
          <>
            <NavLink to="/" isActive={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/games" isActive={isActive('/games')}>
              Games
            </NavLink>
            <NavLink to="/leaderboard" isActive={isActive('/leaderboard')}>
              Leaderboard
            </NavLink>
          </>
        )}
      </div>

      {/* Auth Section */}
      <div style={styles.authSection}>
        {isLoggedIn ? (
          <>
            <Link to="/profile" style={styles.profileLink}>
              <div style={styles.avatarWithInitials}>
                {getUserInitials()}
              </div>
              <span style={styles.profileText}>{user?.username || 'Profile'}</span>
            </Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.loginBtn}>
              Login
            </Link>
            <Link to="/register" style={styles.signupBtn}>
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button 
        style={styles.mobileMenuBtn}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div style={styles.mobileMenu}>
          {isLoggedIn && (
            <>
              <Link to="/" style={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                🏠 Home
              </Link>
              <Link to="/games" style={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                🎮 Games
              </Link>
              <Link to="/leaderboard" style={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                🏆 Leaderboard
              </Link>
            </>
          )}
          {isLoggedIn ? (
            <>
              <Link to="/profile" style={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                👤 Profile
              </Link>
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                style={styles.mobileLogout}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                🔑 Login
              </Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                ✨ Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

/**
 * 🔗 NAV LINK SUB-COMPONENT
 * A reusable component for navigation links with active state
 */
const NavLink = ({ to, children, isActive }) => (
  <Link 
    to={to} 
    style={{
      ...styles.navLink,
      ...(isActive ? styles.navLinkActive : {}),
    }}
  >
    {children}
    {isActive && <div style={styles.activeIndicator} />}
  </Link>
);

/**
 * 🎨 STYLES
 * Using JavaScript objects for CSS allows us to:
 * 1. Use theme variables directly
 * 2. Apply conditional styles easily
 * 3. Keep styles close to component
 */
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'rgba(10, 10, 15, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${theme.colors.neonPurple}33`,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: `0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${theme.colors.neonPurple}11`,
  },

  // Logo styles
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  logoIcon: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    letterSpacing: '0.05em',
  },
  logoAccent: {
    color: theme.colors.neonPurple,
    textShadow: `0 0 20px ${theme.colors.neonPurple}`,
  },

  // Navigation links
  navLinks: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  navLink: {
    position: 'relative',
    color: theme.colors.textSecondary,
    textDecoration: 'none',
    fontFamily: theme.fonts.secondary,
    fontSize: '1rem',
    fontWeight: 500,
    padding: '0.5rem 0',
    transition: 'color 0.3s ease',
    letterSpacing: '0.05em',
  },
  navLinkActive: {
    color: theme.colors.neonCyan,
    textShadow: `0 0 20px ${theme.colors.neonCyan}`,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    borderRadius: '2px',
    boxShadow: `0 0 10px ${theme.colors.neonCyan}`,
  },

  // Auth section
  authSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: theme.colors.textSecondary,
    transition: 'color 0.3s ease',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    boxShadow: `0 0 15px ${theme.colors.neonPurple}55`,
  },
  avatarWithInitials: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.heading,
    color: theme.colors.textPrimary,
    boxShadow: `0 0 15px ${theme.colors.neonPurple}55`,
    border: `2px solid ${theme.colors.neonPurple}`,
  },
  profileText: {
    fontFamily: theme.fonts.secondary,
    fontWeight: 500,
  },
  loginBtn: {
    padding: '0.6rem 1.2rem',
    color: theme.colors.textSecondary,
    textDecoration: 'none',
    fontFamily: theme.fonts.secondary,
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  signupBtn: {
    padding: '0.6rem 1.5rem',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    textDecoration: 'none',
    borderRadius: theme.borderRadius.full,
    fontFamily: theme.fonts.secondary,
    fontWeight: 600,
    boxShadow: `0 0 20px ${theme.colors.neonPurple}55`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  logoutBtn: {
    padding: '0.6rem 1.2rem',
    background: 'transparent',
    color: theme.colors.textMuted,
    border: `1px solid ${theme.colors.textMuted}`,
    borderRadius: theme.borderRadius.md,
    fontFamily: theme.fonts.secondary,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Mobile menu
  mobileMenuBtn: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: theme.colors.textPrimary,
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  mobileMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: theme.colors.bgSecondary,
    borderBottom: `1px solid ${theme.colors.neonPurple}33`,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5)`,
  },
  mobileLink: {
    padding: '1rem',
    color: theme.colors.textSecondary,
    textDecoration: 'none',
    fontFamily: theme.fonts.secondary,
    fontSize: '1.1rem',
    borderRadius: theme.borderRadius.md,
    transition: 'background 0.3s ease',
  },
  mobileLogout: {
    padding: '1rem',
    background: 'transparent',
    border: 'none',
    color: theme.colors.neonRed,
    fontFamily: theme.fonts.secondary,
    fontSize: '1.1rem',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: theme.borderRadius.md,
  },
};

export default Navbar;
