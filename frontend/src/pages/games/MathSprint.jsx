/**
 * 🔢 MATH SPRINT GAME - BrainForge
 * 
 * A timed math game where players solve arithmetic equations as fast as possible.
 * 
 * GAME CONCEPTS:
 * --------------
 * 1. STATE MACHINE: Games often use different "states" (menu, playing, results)
 * 2. TIMER: Using setInterval to count down
 * 3. RANDOM GENERATION: Creating math problems programmatically
 * 4. SCORING SYSTEM: Points based on difficulty and speed
 * 5. DIFFICULTY SCALING: Problems get harder as you progress
 * 
 * REACT CONCEPTS:
 * ---------------
 * - useEffect for timer management
 * - useCallback for memoized functions
 * - Multiple useState for game state
 * - Cleanup functions to prevent memory leaks
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { theme } from '../../styles/theme';

/**
 * 🎮 GAME STATES
 * Using constants for state values prevents typos and makes code clearer
 */
const GAME_STATE = {
  MENU: 'menu',      // Before game starts
  PLAYING: 'playing', // Game in progress
  RESULTS: 'results', // Game over, showing results
};

/**
 * 📊 DIFFICULTY LEVELS
 * Each level has different number ranges and operations
 */
const DIFFICULTY = {
  easy: {
    name: 'Easy',
    color: theme.colors.neonGreen,
    numberRange: [1, 10],
    operations: ['+', '-'],
    timeBonus: 1,
    sparksMultiplier: 1,
  },
  medium: {
    name: 'Medium',
    color: theme.colors.neonCyan,
    numberRange: [5, 25],
    operations: ['+', '-', '×'],
    timeBonus: 1.5,
    sparksMultiplier: 1.5,
  },
  hard: {
    name: 'Hard',
    color: theme.colors.neonOrange,
    numberRange: [10, 50],
    operations: ['+', '-', '×', '÷'],
    timeBonus: 2,
    sparksMultiplier: 2,
  },
  expert: {
    name: 'Expert',
    color: theme.colors.neonPurple,
    numberRange: [10, 100],
    operations: ['+', '-', '×', '÷'],
    timeBonus: 3,
    sparksMultiplier: 3,
  },
};

const GAME_DURATION = 60; // 60 seconds per game

const MathSprint = () => {
  const navigate = useNavigate();

  // Game State
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [difficulty, setDifficulty] = useState('medium');
  
  // Gameplay State
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Current Problem
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'
  
  // Results
  const [sparksEarned, setSparksEarned] = useState(0);

  /**
   * 🎲 GENERATE RANDOM PROBLEM
   * Creates a math problem based on difficulty settings
   */
  const generateProblem = useCallback(() => {
    const diff = DIFFICULTY[difficulty];
    const [min, max] = diff.numberRange;
    
    // Pick random operation
    const operation = diff.operations[Math.floor(Math.random() * diff.operations.length)];
    
    let num1, num2, answer;
    
    // Generate numbers based on operation
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * (max - min + 1)) + min;
        answer = num1 + num2;
        break;
      case '-':
        // Ensure positive result
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '×':
        // Use smaller numbers for multiplication
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        // Generate division that results in whole number
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    setProblem({
      num1,
      num2,
      operation,
      answer,
      display: `${num1} ${operation} ${num2} = ?`,
    });
    setUserAnswer('');
    setFeedback(null);
  }, [difficulty]);

  /**
   * ⏱️ TIMER EFFECT
   * Counts down when game is playing
   */
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up! End game
          setGameState(GAME_STATE.RESULTS);
          calculateSparks();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function - runs when component unmounts or effect re-runs
    return () => clearInterval(timer);
  }, [gameState]);

  /**
   * 🎬 START GAME
   */
  const startGame = () => {
    setGameState(GAME_STATE.PLAYING);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    generateProblem();
  };

  /**
   * ✅ CHECK ANSWER
   */
  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const userNum = parseInt(userAnswer, 10);
    const isCorrect = userNum === problem.answer;
    
    setQuestionsAnswered((prev) => prev + 1);
    
    if (isCorrect) {
      // Correct answer!
      const newStreak = streak + 1;
      const streakBonus = Math.min(newStreak, 10); // Max 10x bonus
      const basePoints = 10 * DIFFICULTY[difficulty].timeBonus;
      const pointsEarned = Math.floor(basePoints * (1 + streakBonus * 0.1));
      
      setScore((prev) => prev + pointsEarned);
      setStreak(newStreak);
      setCorrectAnswers((prev) => prev + 1);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      
      setFeedback('correct');
    } else {
      // Wrong answer
      setStreak(0);
      setFeedback('wrong');
    }
    
    // Generate next problem after short delay
    setTimeout(() => {
      generateProblem();
    }, 500);
  };

  /**
   * ⚡ CALCULATE SPARKS & SUBMIT SCORE TO BACKEND
   */
  const calculateSparks = async () => {
    const accuracy = questionsAnswered > 0 
      ? (correctAnswers / questionsAnswered) * 100 
      : 0;
    
    let sparks = Math.floor(score * DIFFICULTY[difficulty].sparksMultiplier * 0.1);
    
    // Accuracy bonus
    if (accuracy >= 90) sparks = Math.floor(sparks * 1.5);
    else if (accuracy >= 75) sparks = Math.floor(sparks * 1.25);
    
    // Streak bonus
    sparks += bestStreak * 5;
    
    setSparksEarned(sparks);

    // 🚀 Submit score to backend to update user stats
    try {
      const gameData = {
        game_type: 'math-sprint',
        difficulty: difficulty,
        score: score,
        accuracy: accuracy,
        time_taken: GAME_DURATION - timeLeft,
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers,
        best_streak: bestStreak
      };
      
      console.log('📤 Submitting game score:', gameData);
      
      const result = await userAPI.submitGameScore(gameData);
      // Update sparks with actual value from backend
      setSparksEarned(result.sparks_earned);
      console.log('✅ Game score submitted successfully!', result);
    } catch (error) {
      console.error('❌ Failed to submit game score:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Still show calculated sparks even if submission fails
    }
  };

  /**
   * ⌨️ HANDLE KEY PRESS
   * Submit on Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  // Calculate accuracy for display
  const accuracy = questionsAnswered > 0 
    ? Math.round((correctAnswers / questionsAnswered) * 100) 
    : 0;

  return (
    <div style={styles.container}>
      {/* Game Menu */}
      {gameState === GAME_STATE.MENU && (
        <div style={styles.menuCard}>
          <div style={styles.menuHeader}>
            <span style={styles.gameIcon}>🔢</span>
            <h1 style={styles.gameTitle}>Math Sprint</h1>
            <p style={styles.gameDesc}>
              Solve as many equations as you can in 60 seconds!
            </p>
          </div>

          <div style={styles.difficultySection}>
            <h3 style={styles.difficultyTitle}>Select Difficulty</h3>
            <div style={styles.difficultyOptions}>
              {Object.entries(DIFFICULTY).map(([key, diff]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  style={{
                    ...styles.difficultyBtn,
                    ...(difficulty === key ? {
                      borderColor: diff.color,
                      boxShadow: `0 0 20px ${diff.color}55`,
                    } : {}),
                  }}
                >
                  <span style={{ ...styles.diffName, color: diff.color }}>
                    {diff.name}
                  </span>
                  <span style={styles.diffOps}>
                    {diff.operations.join(' ')}
                  </span>
                  <span style={styles.diffXp}>
                    {diff.sparksMultiplier}x ⚡
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame} style={styles.startBtn}>
            <span>🚀</span> Start Game
          </button>

          <button onClick={() => navigate('/games')} style={styles.backBtn}>
            ← Back to Games
          </button>
        </div>
      )}

      {/* Game Playing */}
      {gameState === GAME_STATE.PLAYING && problem && (
        <div style={styles.gameArea}>
          {/* Top Bar */}
          <div style={styles.topBar}>
            <div style={styles.timerContainer}>
              <span style={styles.timerIcon}>⏱️</span>
              <span style={{
                ...styles.timerValue,
                color: timeLeft <= 10 ? theme.colors.neonRed : theme.colors.textPrimary,
              }}>
                {timeLeft}s
              </span>
            </div>
            
            <div style={styles.scoreContainer}>
              <span style={styles.scoreLabel}>Score</span>
              <span style={styles.scoreValue}>{score}</span>
            </div>
            
            <div style={styles.streakContainer}>
              <span style={styles.streakIcon}>🔥</span>
              <span style={styles.streakValue}>{streak}</span>
            </div>
          </div>

          {/* Problem Display */}
          <div style={styles.problemCard}>
            <div style={{
              ...styles.problem,
              ...(feedback === 'correct' ? styles.problemCorrect : {}),
              ...(feedback === 'wrong' ? styles.problemWrong : {}),
            }}>
              {problem.display}
            </div>

            {/* Answer Input */}
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your answer"
              autoFocus
              style={styles.answerInput}
            />

            <button onClick={checkAnswer} style={styles.submitBtn}>
              Submit →
            </button>
          </div>

          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Questions</span>
              <span style={styles.statValue}>{questionsAnswered}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Correct</span>
              <span style={styles.statValue}>{correctAnswers}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Accuracy</span>
              <span style={styles.statValue}>{accuracy}%</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Best Streak</span>
              <span style={styles.statValue}>{bestStreak}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {gameState === GAME_STATE.RESULTS && (
        <div style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <span style={styles.resultsIcon}>🏆</span>
            <h2 style={styles.resultsTitle}>Time's Up!</h2>
          </div>

          <div style={styles.finalScore}>
            <span style={styles.finalScoreLabel}>Final Score</span>
            <span style={styles.finalScoreValue}>{score}</span>
          </div>

          <div style={styles.xpEarned}>
            <span style={styles.xpIcon}>⚡</span>
            <span style={styles.xpValue}>+{sparksEarned} Sparks</span>
          </div>

          <div style={styles.resultsStats}>
            <div style={styles.resultStat}>
              <span style={styles.resultStatLabel}>Questions</span>
              <span style={styles.resultStatValue}>{questionsAnswered}</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatLabel}>Correct</span>
              <span style={styles.resultStatValue}>{correctAnswers}</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatLabel}>Accuracy</span>
              <span style={{
                ...styles.resultStatValue,
                color: accuracy >= 80 ? theme.colors.neonGreen : 
                       accuracy >= 60 ? theme.colors.neonOrange : 
                       theme.colors.neonRed,
              }}>{accuracy}%</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatLabel}>Best Streak</span>
              <span style={styles.resultStatValue}>🔥 {bestStreak}</span>
            </div>
          </div>

          <div style={styles.resultActions}>
            <button onClick={startGame} style={styles.playAgainBtn}>
              🔄 Play Again
            </button>
            <button onClick={() => setGameState(GAME_STATE.MENU)} style={styles.changeDiffBtn}>
              ⚙️ Change Difficulty
            </button>
            <button onClick={() => navigate('/games')} style={styles.exitBtn}>
              ← Back to Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 🎨 STYLES
 */
const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },

  // Menu Card
  menuCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.neonGreen}33`,
    padding: '3rem',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
  },
  menuHeader: {
    marginBottom: '2rem',
  },
  gameIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
    filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))',
  },
  gameTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '0.5rem',
  },
  gameDesc: {
    color: theme.colors.textSecondary,
    fontSize: '1rem',
  },
  difficultySection: {
    marginBottom: '2rem',
  },
  difficultyTitle: {
    color: theme.colors.textMuted,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
  },
  difficultyOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  difficultyBtn: {
    background: theme.colors.bgTertiary,
    border: `2px solid transparent`,
    borderRadius: theme.borderRadius.lg,
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  },
  diffName: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  diffOps: {
    display: 'block',
    fontSize: '0.85rem',
    color: theme.colors.textMuted,
    marginBottom: '0.25rem',
  },
  diffXp: {
    display: 'block',
    fontSize: '0.75rem',
    color: theme.colors.xpGold,
  },
  startBtn: {
    width: '100%',
    padding: '1rem 2rem',
    background: `linear-gradient(135deg, ${theme.colors.neonGreen}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1.25rem',
    fontWeight: 600,
    fontFamily: theme.fonts.secondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: theme.shadows.neonGreen,
    marginBottom: '1rem',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: theme.colors.textMuted,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: theme.fonts.secondary,
  },

  // Game Area
  gameArea: {
    maxWidth: '600px',
    width: '100%',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
  },
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  timerIcon: {
    fontSize: '1.5rem',
  },
  timerValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
  },
  scoreContainer: {
    textAlign: 'center',
  },
  scoreLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.neonGreen,
  },
  streakContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  streakIcon: {
    fontSize: '1.25rem',
  },
  streakValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.streakFire,
  },

  // Problem Card
  problemCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: '3rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  problem: {
    fontSize: '3rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textPrimary,
    marginBottom: '2rem',
    transition: 'all 0.3s ease',
  },
  problemCorrect: {
    color: theme.colors.neonGreen,
    textShadow: `0 0 20px ${theme.colors.neonGreen}`,
  },
  problemWrong: {
    color: theme.colors.neonRed,
    textShadow: `0 0 20px ${theme.colors.neonRed}`,
  },
  answerInput: {
    width: '200px',
    padding: '1rem',
    fontSize: '2rem',
    fontFamily: theme.fonts.mono,
    textAlign: 'center',
    background: theme.colors.bgTertiary,
    border: `2px solid ${theme.colors.neonPurple}55`,
    borderRadius: theme.borderRadius.lg,
    color: theme.colors.textPrimary,
    outline: 'none',
    marginBottom: '1rem',
  },
  submitBtn: {
    display: 'block',
    width: '200px',
    margin: '0 auto',
    padding: '0.75rem 1.5rem',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: theme.fonts.secondary,
  },

  // Stats Bar
  statsBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '1rem',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
  },
  stat: {
    textAlign: 'center',
  },
  statLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },

  // Results Card
  resultsCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.xpGold}33`,
    padding: '3rem',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
  },
  resultsHeader: {
    marginBottom: '2rem',
  },
  resultsIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  resultsTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
  },
  finalScore: {
    marginBottom: '1rem',
  },
  finalScoreLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  finalScoreValue: {
    fontSize: '4rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.neonGreen,
    textShadow: `0 0 30px ${theme.colors.neonGreen}55`,
  },
  xpEarned: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: `${theme.colors.xpGold}22`,
    borderRadius: theme.borderRadius.full,
    marginBottom: '2rem',
  },
  xpIcon: {
    fontSize: '1.25rem',
  },
  xpValue: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.xpGold,
  },
  resultsStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.lg,
  },
  resultStat: {
    textAlign: 'center',
  },
  resultStatLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  resultStatValue: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  resultActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  playAgainBtn: {
    padding: '1rem',
    background: `linear-gradient(135deg, ${theme.colors.neonGreen}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: theme.fonts.secondary,
  },
  changeDiffBtn: {
    padding: '0.75rem',
    background: theme.colors.bgTertiary,
    color: theme.colors.textSecondary,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: theme.fonts.secondary,
  },
  exitBtn: {
    background: 'transparent',
    border: 'none',
    color: theme.colors.textMuted,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: theme.fonts.secondary,
  },
};

export default MathSprint;
