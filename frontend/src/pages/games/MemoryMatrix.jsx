/**
 * 🧩 MEMORY MATRIX GAME - BrainForge
 * 
 * A visual memory game where players must remember and reproduce patterns on a grid.
 * 
 * GAME FLOW:
 * 1. Grid of cells is shown
 * 2. Some cells light up in a pattern
 * 3. Pattern disappears
 * 4. Player must click the cells that were lit
 * 5. Score based on accuracy and speed
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const GAME_STATE = {
  MENU: 'menu',
  MEMORIZE: 'memorize',
  RECALL: 'recall',
  RESULTS: 'results',
};

const DIFFICULTY = {
  easy: {
    name: 'Easy',
    color: theme.colors.neonGreen,
    gridSize: 3,
    cellsToShow: 3,
    memorizeTime: 3000,
    sparksMultiplier: 1,
  },
  medium: {
    name: 'Medium',
    color: theme.colors.neonCyan,
    gridSize: 4,
    cellsToShow: 5,
    memorizeTime: 2500,
    sparksMultiplier: 1.5,
  },
  hard: {
    name: 'Hard',
    color: theme.colors.neonOrange,
    gridSize: 5,
    cellsToShow: 8,
    memorizeTime: 2000,
    sparksMultiplier: 2,
  },
  expert: {
    name: 'Expert',
    color: theme.colors.neonPurple,
    gridSize: 6,
    cellsToShow: 12,
    memorizeTime: 1500,
    sparksMultiplier: 3,
  },
};

const ROUNDS = 5;

const MemoryMatrix = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [difficulty, setDifficulty] = useState('medium');
  
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalCells, setTotalCells] = useState(0);
  
  const [pattern, setPattern] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [showPattern, setShowPattern] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [sparksEarned, setSparksEarned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  const gridSize = DIFFICULTY[difficulty].gridSize;
  const cellsToShow = DIFFICULTY[difficulty].cellsToShow;
  const memorizeTime = DIFFICULTY[difficulty].memorizeTime;

  /**
   * Generate random pattern
   */
  const generatePattern = useCallback(() => {
    const totalCells = gridSize * gridSize;
    const indices = Array.from({ length: totalCells }, (_, i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, cellsToShow);
  }, [gridSize, cellsToShow]);

  /**
   * Start new game
   */
  const startGame = () => {
    setGameState(GAME_STATE.MEMORIZE);
    setRound(1);
    setScore(0);
    setTotalCorrect(0);
    setTotalCells(0);
    setSelectedCells([]);
    setGameStartTime(Date.now());
    startRound();
  };

  /**
   * Start a new round
   */
  const startRound = () => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setShowPattern(true);
    setSelectedCells([]);
    setTimeLeft(memorizeTime / 1000);
    
    // Hide pattern after memorize time
    const timer = setTimeout(() => {
      setShowPattern(false);
      setGameState(GAME_STATE.RECALL);
    }, memorizeTime);
    
    return () => clearTimeout(timer);
  };

  /**
   * Timer for memorize phase
   */
  useEffect(() => {
    if (gameState === GAME_STATE.MEMORIZE && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, timeLeft]);

  /**
   * Handle cell click during recall
   */
  const handleCellClick = (index) => {
    if (gameState !== GAME_STATE.RECALL) return;
    
    if (selectedCells.includes(index)) {
      setSelectedCells(selectedCells.filter((i) => i !== index));
    } else {
      setSelectedCells([...selectedCells, index]);
    }
  };

  /**
   * Submit answer
   */
  const submitAnswer = () => {
    const correctCells = selectedCells.filter((i) => pattern.includes(i)).length;
    const incorrectCells = selectedCells.filter((i) => !pattern.includes(i)).length;
    const missedCells = pattern.filter((i) => !selectedCells.includes(i)).length;
    
    const roundScore = (correctCells * 100) - (incorrectCells * 50) - (missedCells * 25);
    const finalScore = Math.max(0, roundScore);
    
    setScore((prev) => prev + finalScore);
    setTotalCorrect((prev) => prev + correctCells);
    setTotalCells((prev) => prev + pattern.length);
    
    if (round < ROUNDS) {
      // Next round
      setTimeout(() => {
        setRound((prev) => prev + 1);
        setGameState(GAME_STATE.MEMORIZE);
        startRound();
      }, 1500);
    } else {
      // Game over
      setTimeout(() => {
        endGame();
      }, 1500);
    }
  };

  /**
   * End game and submit score
   */
  const endGame = async () => {
    setGameState(GAME_STATE.RESULTS);
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = totalCells > 0 ? (totalCorrect / totalCells) * 100 : 0;
    
    // Calculate sparks
    const baseSparks = Math.floor(score * 0.1);
    let sparks = Math.floor(baseSparks * DIFFICULTY[difficulty].sparksMultiplier);
    if (accuracy >= 90) sparks = Math.floor(sparks * 1.5);
    else if (accuracy >= 75) sparks = Math.floor(sparks * 1.25);
    
    setSparksEarned(sparks);
    
    // Submit to backend
    try {
      const gameData = {
        game_type: 'memory-matrix',
        difficulty: difficulty,
        score: score,
        accuracy: accuracy,
        time_taken: timeTaken,
      };
      
      console.log('📤 Submitting Memory Matrix score:', gameData);
      const result = await userAPI.submitGameScore(gameData);
      setSparksEarned(result.sparks_earned);
      console.log('✅ Score submitted:', result);
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
    }
  };

  /**
   * Cell renderer
   */
  const renderCell = (index) => {
    const isPattern = pattern.includes(index);
    const isSelected = selectedCells.includes(index);
    const isCorrect = isSelected && isPattern;
    const isWrong = isSelected && !isPattern;
    
    let cellStyle = { ...styles.cell };
    
    if (showPattern && isPattern) {
      cellStyle = { ...cellStyle, ...styles.cellActive };
    } else if (gameState === GAME_STATE.RECALL && isSelected) {
      cellStyle = { ...cellStyle, ...styles.cellSelected };
    }
    
    return (
      <div
        key={index}
        style={cellStyle}
        onClick={() => handleCellClick(index)}
      />
    );
  };

  return (
    <div style={styles.container}>
      {/* Menu */}
      {gameState === GAME_STATE.MENU && (
        <div style={styles.menuCard}>
          <div style={styles.menuHeader}>
            <span style={styles.gameIcon}>🧩</span>
            <h1 style={styles.gameTitle}>Memory Matrix</h1>
            <p style={styles.gameDesc}>
              Remember the pattern and reproduce it! {ROUNDS} rounds of increasing challenge.
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
                  <span style={styles.diffDesc}>
                    {diff.gridSize}x{diff.gridSize} grid • {diff.cellsToShow} cells
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
      {(gameState === GAME_STATE.MEMORIZE || gameState === GAME_STATE.RECALL) && (
        <div style={styles.gameArea}>
          <div style={styles.topBar}>
            <div style={styles.roundInfo}>
              Round {round} / {ROUNDS}
            </div>
            <div style={styles.scoreInfo}>
              Score: {score}
            </div>
          </div>

          {gameState === GAME_STATE.MEMORIZE && (
            <div style={styles.instruction}>
              🧠 Memorize the pattern! ({timeLeft}s)
            </div>
          )}
          
          {gameState === GAME_STATE.RECALL && (
            <div style={styles.instruction}>
              🎯 Click the cells that were lit up!
            </div>
          )}

          <div 
            style={{
              ...styles.grid,
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }, (_, i) => renderCell(i))}
          </div>

          {gameState === GAME_STATE.RECALL && (
            <button onClick={submitAnswer} style={styles.submitBtn}>
              Submit Answer
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {gameState === GAME_STATE.RESULTS && (
        <div style={styles.resultsCard}>
          <div style={styles.resultIcon}>🏆</div>
          <h2 style={styles.resultTitle}>Game Complete!</h2>
          
          <div style={styles.resultScore}>
            <span style={styles.resultScoreLabel}>FINAL SCORE</span>
            <span style={styles.resultScoreValue}>{score}</span>
          </div>

          <div style={styles.sparksBox}>
            <span>⚡</span> +{sparksEarned} Sparks
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{totalCorrect} / {totalCells}</div>
              <div style={styles.statLabel}>CORRECT CELLS</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {totalCells > 0 ? Math.round((totalCorrect / totalCells) * 100) : 0}%
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

/**
 * Styles
 */
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
    marginBottom: '1rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  instruction: {
    textAlign: 'center',
    fontSize: '1.25rem',
    color: theme.colors.neonCyan,
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    aspectRatio: '1',
  },
  cell: {
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cellActive: {
    background: theme.colors.neonCyan,
    boxShadow: `0 0 20px ${theme.colors.neonCyan}`,
  },
  cellSelected: {
    background: theme.colors.neonPurple,
    boxShadow: `0 0 15px ${theme.colors.neonPurple}`,
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    background: `linear-gradient(135deg, ${theme.colors.neonGreen}, ${theme.colors.neonCyan})`,
    color: theme.colors.textPrimary,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
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

export default MemoryMatrix;
