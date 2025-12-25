/**
 * 🧠 DUAL N-BACK - BrainForge
 * 
 * The gold standard for working memory training.
 * Track TWO sequences simultaneously:
 * - Visual: Grid position
 * - Audio: Letter sound
 * 
 * Press A if current position matches N positions back
 * Press L if current letter matches N positions back
 * 
 * Research shows this improves fluid intelligence!
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  RESULTS: 'results',
};

const DIFFICULTY = {
  '1-back': {
    name: '1-Back',
    color: theme.colors.neonGreen,
    nLevel: 1,
    trials: 20,
    intervalMs: 2500,
    sparksMultiplier: 1,
  },
  '2-back': {
    name: '2-Back',
    color: theme.colors.neonCyan,
    nLevel: 2,
    trials: 25,
    intervalMs: 2500,
    sparksMultiplier: 1.5,
  },
  '3-back': {
    name: '3-Back',
    color: theme.colors.neonOrange,
    nLevel: 3,
    trials: 30,
    intervalMs: 2500,
    sparksMultiplier: 2,
  },
  '4-back': {
    name: '4-Back',
    color: theme.colors.neonPurple,
    nLevel: 4,
    trials: 35,
    intervalMs: 2500,
    sparksMultiplier: 3,
  },
};

const GRID_SIZE = 3; // 3x3 grid
const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

const DualNBack = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [difficulty, setDifficulty] = useState('2-back');
  
  const [trialIndex, setTrialIndex] = useState(0);
  const [positionHistory, setPositionHistory] = useState([]);
  const [letterHistory, setLetterHistory] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [currentLetter, setCurrentLetter] = useState(null);
  
  const [positionMatches, setPositionMatches] = useState([]);
  const [letterMatches, setLetterMatches] = useState([]);
  const [userPositionPresses, setUserPositionPresses] = useState([]);
  const [userLetterPresses, setUserLetterPresses] = useState([]);
  
  const [score, setScore] = useState(0);
  const [showStimulus, setShowStimulus] = useState(false);
  
  const [sparksEarned, setSparksEarned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  const config = DIFFICULTY[difficulty];
  const nLevel = config.nLevel;

  /**
   * Generate trial sequence
   */
  const generateSequence = useCallback(() => {
    const positions = [];
    const letters = [];
    const posMatches = [];
    const letMatches = [];
    
    // Generate with controlled match rate (30-40%)
    for (let i = 0; i < config.trials; i++) {
      if (i < nLevel) {
        // First N trials - no matches possible
        positions.push(Math.floor(Math.random() * 9));
        letters.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
        posMatches.push(false);
        letMatches.push(false);
      } else {
        // Decide if this should be a match (35% chance for each)
        const shouldPosMatch = Math.random() < 0.35;
        const shouldLetMatch = Math.random() < 0.35;
        
        if (shouldPosMatch) {
          positions.push(positions[i - nLevel]);
          posMatches.push(true);
        } else {
          // Ensure it's different from N-back
          let newPos;
          do {
            newPos = Math.floor(Math.random() * 9);
          } while (newPos === positions[i - nLevel]);
          positions.push(newPos);
          posMatches.push(false);
        }
        
        if (shouldLetMatch) {
          letters.push(letters[i - nLevel]);
          letMatches.push(true);
        } else {
          let newLetter;
          do {
            newLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
          } while (newLetter === letters[i - nLevel]);
          letters.push(newLetter);
          letMatches.push(false);
        }
      }
    }
    
    return { positions, letters, posMatches, letMatches };
  }, [config.trials, nLevel]);

  /**
   * Start game
   */
  const startGame = () => {
    const { positions, letters, posMatches, letMatches } = generateSequence();
    setPositionHistory(positions);
    setLetterHistory(letters);
    setPositionMatches(posMatches);
    setLetterMatches(letMatches);
    setUserPositionPresses([]);
    setUserLetterPresses([]);
    setTrialIndex(0);
    setScore(0);
    setGameStartTime(Date.now());
    setGameState(GAME_STATE.PLAYING);
    
    // Start first trial
    showTrial(0, positions, letters);
  };

  /**
   * Show stimulus for current trial
   */
  const showTrial = (index, positions, letters) => {
    if (index >= positions.length) {
      endGame();
      return;
    }
    
    setCurrentPosition(positions[index]);
    setCurrentLetter(letters[index]);
    setShowStimulus(true);
    
    // Speak letter (text-to-speech)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(letters[index]);
      utterance.rate = 1.2;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
    
    // Hide stimulus after 500ms, wait for interval, then next trial
    setTimeout(() => {
      setShowStimulus(false);
    }, 500);
  };

  /**
   * Handle keyboard input
   */
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    
    const handleKeyPress = (e) => {
      const key = e.key.toUpperCase();
      
      if (key === 'A') {
        // Position match pressed
        setUserPositionPresses((prev) => [...prev, trialIndex]);
      } else if (key === 'L') {
        // Letter match pressed
        setUserLetterPresses((prev) => [...prev, trialIndex]);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, trialIndex]);

  /**
   * Trial progression
   */
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING && trialIndex < config.trials) {
      const timer = setTimeout(() => {
        setTrialIndex((prev) => prev + 1);
        showTrial(trialIndex + 1, positionHistory, letterHistory);
      }, config.intervalMs);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, trialIndex, config.trials, config.intervalMs, positionHistory, letterHistory]);

  /**
   * Calculate score
   */
  const calculateScore = () => {
    let posCorrect = 0;
    let posMissed = 0;
    let posFalseAlarm = 0;
    let letCorrect = 0;
    let letMissed = 0;
    let letFalseAlarm = 0;
    
    // Check position responses
    for (let i = nLevel; i < config.trials; i++) {
      const wasMatch = positionMatches[i];
      const userPressed = userPositionPresses.includes(i);
      
      if (wasMatch && userPressed) posCorrect++;
      else if (wasMatch && !userPressed) posMissed++;
      else if (!wasMatch && userPressed) posFalseAlarm++;
    }
    
    // Check letter responses
    for (let i = nLevel; i < config.trials; i++) {
      const wasMatch = letterMatches[i];
      const userPressed = userLetterPresses.includes(i);
      
      if (wasMatch && userPressed) letCorrect++;
      else if (wasMatch && !userPressed) letMissed++;
      else if (!wasMatch && userPressed) letFalseAlarm++;
    }
    
    // Calculate total score (hits + correct rejections - false alarms)
    const totalScore = (posCorrect + letCorrect) * 100 - (posFalseAlarm + letFalseAlarm) * 25;
    
    return {
      score: Math.max(0, totalScore),
      posCorrect,
      posMissed,
      posFalseAlarm,
      letCorrect,
      letMissed,
      letFalseAlarm,
      posAccuracy: posCorrect / (posCorrect + posMissed || 1) * 100,
      letAccuracy: letCorrect / (letCorrect + letMissed || 1) * 100,
    };
  };

  /**
   * End game
   */
  const endGame = async () => {
    setGameState(GAME_STATE.RESULTS);
    
    const results = calculateScore();
    setScore(results.score);
    
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const avgAccuracy = (results.posAccuracy + results.letAccuracy) / 2;
    
    // Calculate sparks
    const baseSparks = Math.floor(results.score * 0.15);
    let sparks = Math.floor(baseSparks * config.sparksMultiplier);
    if (avgAccuracy >= 80) sparks = Math.floor(sparks * 1.5);
    else if (avgAccuracy >= 60) sparks = Math.floor(sparks * 1.25);
    
    setSparksEarned(sparks);
    
    // Submit to backend
    try {
      const gameData = {
        game_type: 'dual-n-back',
        difficulty: difficulty,
        score: Math.round(results.score),
        accuracy: avgAccuracy,
        time_taken: timeTaken,
      };
      
      console.log('📤 Submitting Dual N-Back score:', gameData);
      const result = await userAPI.submitGameScore(gameData);
      setSparksEarned(result.sparks_earned);
      console.log('✅ Score submitted:', result);
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Menu */}
      {gameState === GAME_STATE.MENU && (
        <div style={styles.menuCard}>
          <div style={styles.menuHeader}>
            <span style={styles.gameIcon}>🧠</span>
            <h1 style={styles.gameTitle}>Dual N-Back</h1>
            <p style={styles.gameDesc}>
              The most scientifically validated brain training game. Track visual positions AND audio letters simultaneously!
            </p>
          </div>

          <div style={styles.instructions}>
            <h3 style={styles.instructionsTitle}>How to Play:</h3>
            <ul style={styles.instructionsList}>
              <li>Watch squares flash on the grid while hearing letters</li>
              <li>Press <strong>A</strong> if position matches N steps back</li>
              <li>Press <strong>L</strong> if letter matches N steps back</li>
              <li>Both can match at the same time!</li>
            </ul>
          </div>

          <div style={styles.difficultySection}>
            <h3 style={styles.difficultyTitle}>Select N-Level</h3>
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
                    {diff.trials} trials • Remember {diff.nLevel} back
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
              Trial {trialIndex + 1} / {config.trials}
            </div>
            <div style={styles.nLevel}>
              {config.name}
            </div>
          </div>

          <div style={styles.grid}>
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                style={{
                  ...styles.gridCell,
                  ...(showStimulus && currentPosition === i ? styles.gridCellActive : {}),
                }}
              />
            ))}
          </div>

          <div style={styles.controls}>
            <div style={styles.controlKey}>
              <div style={styles.keyButton}>A</div>
              <div style={styles.keyLabel}>Position Match</div>
            </div>
            <div style={styles.controlKey}>
              <div style={styles.keyButton}>L</div>
              <div style={styles.keyLabel}>Letter Match</div>
            </div>
          </div>

          <div style={styles.hint}>
            Listen for the letter! Press keys when you recognize a match.
          </div>
        </div>
      )}

      {/* Results */}
      {gameState === GAME_STATE.RESULTS && (
        <div style={styles.resultsCard}>
          <div style={styles.resultIcon}>🏆</div>
          <h2 style={styles.resultTitle}>Session Complete!</h2>
          
          <div style={styles.resultScore}>
            <span style={styles.resultScoreLabel}>FINAL SCORE</span>
            <span style={styles.resultScoreValue}>{Math.round(score)}</span>
          </div>

          <div style={styles.sparksBox}>
            <span>⚡</span> +{sparksEarned} Sparks
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{config.name}</div>
              <div style={styles.statLabel}>DIFFICULTY</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{config.trials}</div>
              <div style={styles.statLabel}>TRIALS</div>
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
    maxWidth: '600px',
    width: '100%',
    border: `1px solid ${theme.colors.bgTertiary}`,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  progress: {
    color: theme.colors.textSecondary,
  },
  nLevel: {
    color: theme.colors.neonCyan,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
    aspectRatio: '1',
    maxWidth: '400px',
    margin: '0 auto 2rem',
  },
  gridCell: {
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.md,
    transition: 'all 0.2s ease',
  },
  gridCellActive: {
    background: theme.colors.neonCyan,
    boxShadow: `0 0 30px ${theme.colors.neonCyan}`,
    transform: 'scale(1.1)',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '1.5rem',
  },
  controlKey: {
    textAlign: 'center',
  },
  keyButton: {
    width: '60px',
    height: '60px',
    background: theme.colors.bgPrimary,
    border: `2px solid ${theme.colors.neonCyan}`,
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: theme.colors.neonCyan,
    marginBottom: '0.5rem',
  },
  keyLabel: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
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

export default DualNBack;
