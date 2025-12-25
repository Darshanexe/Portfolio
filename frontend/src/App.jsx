/**
 * 🧠 BRAINFORGE - Main App Component
 * 
 * This is the root component that sets up:
 * - React Router for navigation
 * - Global layout (Navbar)
 * - Route definitions
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Games from './pages/Games';
import Leaderboard from './pages/Leaderboard';
import MathSprint from './pages/games/MathSprint';
import MemoryMatrix from './pages/games/MemoryMatrix';
import WordLogic from './pages/games/WordLogic';
import DualNBack from './pages/games/DualNBack';
import StroopTask from './pages/games/StroopTask';
import TaskSwitching from './pages/games/TaskSwitching';
import TowerOfHanoi from './pages/games/TowerOfHanoi';

function App() {
  return (
    <Router>
      <div style={styles.app}>
        <Navbar />
        <main style={styles.main}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes (require login) */}
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Games />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/math-sprint"
              element={
                <ProtectedRoute>
                  <MathSprint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/memory-matrix"
              element={
                <ProtectedRoute>
                  <MemoryMatrix />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/word-logic"
              element={
                <ProtectedRoute>
                  <WordLogic />
                </ProtectedRoute>
              }
            />
            <Route              path="/games/dual-n-back"
              element={
                <ProtectedRoute>
                  <DualNBack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/stroop-task"
              element={
                <ProtectedRoute>
                  <StroopTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/task-switching"
              element={
                <ProtectedRoute>
                  <TaskSwitching />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/tower-of-hanoi"
              element={
                <ProtectedRoute>
                  <TowerOfHanoi />
                </ProtectedRoute>
              }
            />
            <Route              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

/**
 * 🚧 COMING SOON PLACEHOLDER
 */
const ComingSoon = ({ title }) => (
  <div style={styles.comingSoon}>
    <span style={styles.comingSoonIcon}>🚧</span>
    <h1 style={styles.comingSoonTitle}>{title}</h1>
    <p style={styles.comingSoonText}>Coming Soon</p>
  </div>
);

const styles = {
  app: {
    minHeight: '100vh',
  },
  main: {
    minHeight: 'calc(100vh - 80px)',
  },
  comingSoon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)',
    textAlign: 'center',
  },
  comingSoonIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  comingSoonTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#a855f7',
    marginBottom: '0.5rem',
  },
  comingSoonText: {
    fontSize: '1.25rem',
    color: '#71717a',
  },
};

export default App;
