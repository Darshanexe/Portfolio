/**
 * 🎨 STROOP TASK - BrainForge
 * 
 * Classic test of inhibitory control and selective attention.
 * The word names a color, but is written in a different color.
 * Identify the COLOR of the text, not the word itself!
 * 
 * Trains your brain to suppress automatic responses.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  RESULTS: 'results',
};

const DIFFICULTY = {
  easy: {
    name: 'Easy',
    color: theme.colors.neonGreen,
    totalTrials: 20,
    timePerTrial: 3000,
    congruentPercent: 50, // Half are congruent (RED in red)
    sparksMultiplier: 1,
  },
  medium: {
    name: 'Medium',
    color: theme.colors.neonCyan,
    totalTrials: 30,
    timePerTrial: 2000,
    congruentPercent: 30,
    sparksMultiplier: 1.5,
  },
  hard: {
    name: 'Hard',
    color: theme.colors.neonOrange,
    totalTrials: 40,
    timePerTrial: 1500,
    congruentPercent: 20,
    sparksMultiplier: 2,
  },
  extreme: {
    name: 'Extreme',
    color: theme.colors.neonPurple,
    totalTrials: 50,
    timePerTrial: 1200,
    congruentPercent: 10,
    sparksMultiplier: 3,
  },
};

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
];

const StroopTask = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [difficulty, setDifficulty] = useState('medium');
  
  const [trialIndex, setTrialIndex] = useState(0);
  const [word, setWord] = useState('');
  const [wordColor, setWordColor] = useState('');
  const [correctColor, setCorrectColor] = useState('');
  const [isCongruent, setIsCongruent] = useState(false);
  
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeouts, setTimeouts] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  
  const [sparksEarned, setSparksEarned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const trialStartTime = useRef(0);
  const trialTimer = useRef(null);

  const config = DIFFICULTY[difficulty];

  /**
   * Generate trial
   */
  const generateTrial = () => {
    const shouldBeCongruent = Math.random() * 100 < config.congruentPercent;
    
    const wordColorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    let displayColorObj;
    
    if (shouldBeCongruent) {
      displayColorObj = wordColorObj;
    } else {
      // Incongruent - pick different color
      do {
        displayColorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (displayColorObj.name === wordColorObj.name);
    }
    
    setWord(wordColorObj.name);
    setWordColor(displayColorObj.hex);
    setCorrectColor(displayColorObj.name);
    setIsCongruent(shouldBeCongruent);
    trialStartTime.current = Date.now();
    
    // Set timeout for this trial
    trialTimer.current = setTimeout(() => {
      handleTimeout();
    }, config.timePerTrial);
  };

  /**
   * Start game
   */
  const startGame = () => {
    setTrialIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTimeouts(0);
    setReactionTimes([]);
    setGameStartTime(Date.now());
    setGameState(GAME_STATE.PLAYING);
    generateTrial();
  };

  /**
   * Handle answer
   */
  const handleAnswer = (selectedColor) => {
    if (showFeedback) return;
    
    clearTimeout(trialTimer.current);
    
    const reactionTime = Date.now() - trialStartTime.current;
    setReactionTimes((prev) => [...prev, reactionTime]);
    
    if (selectedColor === correctColor) {
      setCorrectAnswers((prev) => prev + 1);
      setScore((prev) => prev + 100);
      setFeedbackType('correct');
    } else {
      setWrongAnswers((prev) => prev + 1);
      setFeedbackType('wrong');
    }
    
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      nextTrial();
    }, 400);
  };

  /**
   * Handle timeout
   */
  const handleTimeout = () => {
    setTimeouts((prev) => prev + 1);
    setFeedbackType('timeout');
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      nextTrial();
    }, 600);
  };

  /**
   * Next trial
   */
  const nextTrial = () => {
    if (trialIndex + 1 >= config.totalTrials) {
      endGame();
    } else {
      setTrialIndex((prev) => prev + 1);
      generateTrial();
    }
  };

  /**
   * End game
   */
  const endGame = async () => {
    clearTimeout(trialTimer.current);
    setGameState(GAME_STATE.RESULTS);
    
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = (correctAnswers / config.totalTrials) * 100;
    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    
    // Calculate sparks
    let sparks = Math.floor(score * config.sparksMultiplier * 0.1);
    if (accuracy >= 90) sparks = Math.floor(sparks * 1.5);
    else if (accuracy >= 75) sparks = Math.floor(sparks * 1.25);
    
    setSparksEarned(sparks);
    
    // Submit to backend
    try {
      const gameData = {
        game_type: 'stroop-task',
        difficulty: difficulty,
        score: Math.round(score),
        accuracy: accuracy,
        time_taken: timeTaken,
      };
      
      console.log('📤 Submitting Stroop Task score:', gameData);
      const result = await userAPI.submitGameScore(gameData);
      setSparksEarned(result.sparks_earned);
      console.log('✅ Score submitted:', result);
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (trialTimer.current) {
        clearTimeout(trialTimer.current);
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      {/* Menu */}
      {gameState === GAME_STATE.MENU && (
        <div style={styles.menuCard}>
          <div style={styles.menuHeader}>
            <span style={styles.gameIcon}>🎨</span>
            <h1 style={styles.gameTitle}>Stroop Task</h1>
            <p style={styles.gameDesc}>
              The classic cognitive test! Name the COLOR of the text, not the word itself. Suppress your automatic reading response!
            </p>
          </div>

          <div style={styles.instructions}>
            <h3 style={styles.instructionsTitle}>How to Play:</h3>
            <div style={styles.stroopExample}>
              <div style={{ ...styles.stroopWord, color: '#3b82f6' }}>RED</div>
              <div style={styles.stroopExplanation}>
                The word says "RED" but is written in BLUE.
                <br />
                Click <strong>BLUE</strong>!
              </div>
            </div>
            <ul style={styles.instructionsList}>
              <li>A color word will appear</li>
              <li>The text color will often be DIFFERENT from the word</li>
              <li>Click the color of the TEXT, ignore what the word says</li>
              <li>Be fast but accurate!</li>
            </ul>
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
                  <span style={styles.diffDesc}>
                    {diff.totalTrials} trials • {(diff.timePerTrial / 1000).toFixed(1)}s each • {diff.congruentPercent}% congruent
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

      {/* Playing */}
      {gameState === GAME_STATE.PLAYING && (
        <div style={styles.gameArea}>
          <div style={styles.topBar}>
            <div style={styles.progress}>
              {trialIndex + 1} / {config.totalTrials}
            </div>
            <div style={styles.scoreDisplay}>
              Score: {score}
            </div>
          </div>

          <div style={styles.stroopDisplay}>
            <div 
              style={{
                ...styles.stroopWordLarge,
                color: wordColor,
                ...(showFeedback && feedbackType === 'correct' ? styles.feedbackCorrect : {}),
                ...(showFeedback && feedbackType === 'wrong' ? styles.feedbackWrong : {}),
                ...(showFeedback && feedbackType === 'timeout' ? styles.feedbackTimeout : {}),
              }}
            >
              {word}
            </div>
            
            {showFeedback && (
              <div style={styles.feedbackText}>
                {feedbackType === 'correct' && '✓ Correct!'}
                {feedbackType === 'wrong' && '✗ Wrong!'}
                {feedbackType === 'timeout' && '⏱️ Too slow!'}
              </div>
            )}
          </div>

          <div style={styles.colorOptions}>
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleAnswer(color.name)}
                disabled={showFeedback}
                style={{
                  ...styles.colorBtn,
                  backgroundColor: color.hex,
                  opacity: showFeedback ? 0.5 : 1,
                }}
              >
                {color.name}
              </button>
            ))}
          </div>

          <div style={styles.hint}>
            Click the COLOR of the text, not what the word says!
          </div>
        </div>
      )}

      {/* Results */}
      {gameState === GAME_STATE.RESULTS && (
        <div style={styles.resultsCard}>
          <div style={styles.resultIcon}>🎯</div>
          <h2 style={styles.resultTitle}>Task Complete!</h2>
          
          <div style={styles.resultScore}>
            <span style={styles.resultScoreLabel}>FINAL SCORE</span>
            <span style={styles.resultScoreValue}>{Math.round(score)}</span>
          </div>

          <div style={styles.sparksBox}>
            <span>⚡</span> +{sparksEarned} Sparks
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{correctAnswers}</div>
              <div style={styles.statLabel}>CORRECT</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{wrongAnswers}</div>
              <div style={styles.statLabel}>WRONG</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{timeouts}</div>
              <div style={styles.statLabel}>TIMEOUTS</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {((correctAnswers / config.totalTrials) * 100).toFixed(0)}%
              </div>
              <div style={styles.statLabel}>ACCURACY</div>
            </div>
          </div>

          <button onClick={startGame} style={styles.playAgainBtn}>
            🔄 Play Again
          </button>

          <button onClick={() => navigate('/games')} style={styles.backBtnResults}>
            ← Back to Games
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  menuCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    border: `1px solid ${theme.colors.bgTertiary}`,
  },
  menuHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  gameIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    display: 'block',
  },
  gameTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textPrimary,
    marginBottom: '0.5rem',
  },
  gameDesc: {
    fontSize: '1rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.6,
  },
  instructions: {
    background: theme.colors.bgPrimary,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    marginBottom: '2rem',
    border: `1px solid ${theme.colors.bgTertiary}`,
  },
  instructionsTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '1rem',
  },
  stroopExample: {
    textAlign: 'center',
    padding: '1.5rem',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: '1rem',
  },
  stroopWord: {
    fontSize: '3rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    marginBottom: '0.5rem',
  },
  stroopExplanation: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.6,
  },
  instructionsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  difficultySection: {
    marginBottom: '2rem',
  },
  difficultyTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '1rem',
  },
  difficultyOptions: {
    display: 'grid',
    gap: '1rem',
  },
  difficultyBtn: {
    background: theme.colors.bgPrimary,
    border: `2px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.lg,
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  diffName: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  diffDesc: {
    fontSize: '0.9rem',
    color: theme.colors.textMuted,
  },
  diffXp: {
    fontSize: '0.9rem',
    color: theme.colors.neonCyan,
  },
  startBtn: {
    width: '100%',
    padding: '1rem',
    background: `linear-gradient(135deg, ${theme.colors.neonPurple}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  backBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'transparent',
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.lg,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  gameArea: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: '2rem',
    maxWidth: '800px',
    width: '100%',
    border: `1px solid ${theme.colors.bgTertiary}`,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '3rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  progress: {
    color: theme.colors.textSecondary,
  },
  scoreDisplay: {
    color: theme.colors.neonGreen,
    fontFamily: theme.fonts.mono,
  },
  stroopDisplay: {
    textAlign: 'center',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  stroopWordLarge: {
    fontSize: '5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
    transition: 'all 0.2s ease',
  },
  feedbackCorrect: {
    transform: 'scale(1.1)',
    filter: 'brightness(1.5)',
  },
  feedbackWrong: {
    transform: 'scale(0.9)',
    filter: 'brightness(0.5)',
  },
  feedbackTimeout: {
    opacity: 0.3,
  },
  feedbackText: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: '1rem',
    color: theme.colors.neonCyan,
  },
  colorOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  colorBtn: {
    padding: '1.5rem 1rem',
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  },
  hint: {
    textAlign: 'center',
    fontSize: '0.95rem',
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  resultsCard: {
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    border: `1px solid ${theme.colors.bgTertiary}`,
    textAlign: 'center',
  },
  resultIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  resultTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    marginBottom: '1.5rem',
  },
  resultScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  resultScoreLabel: {
    fontSize: '0.9rem',
    color: theme.colors.textMuted,
    marginBottom: '0.5rem',
  },
  resultScoreValue: {
    fontSize: '3rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonGreen,
    textShadow: `0 0 30px ${theme.colors.neonGreen}`,
  },
  sparksBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 2rem',
    background: `${theme.colors.neonCyan}22`,
    borderRadius: theme.borderRadius.full,
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.colors.neonCyan,
    marginBottom: '2rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statBox: {
    background: theme.colors.bgPrimary,
    borderRadius: theme.borderRadius.lg,
    padding: '1rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonCyan,
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  playAgainBtn: {
    width: '100%',
    padding: '1rem',
    background: `linear-gradient(135deg, ${theme.colors.neonGreen}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  backBtnResults: {
    width: '100%',
    padding: '0.75rem',
    background: 'transparent',
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.lg,
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default StroopTask;
