/**
 * 🗼 TOWER OF HANOI - BrainForge
 * 
 * The legendary puzzle for strategic planning and problem-solving!
 * Move all disks from the first tower to the last tower.
 * 
 * Rules:
 * 1. Only one disk can be moved at a time
 * 2. A disk can only be placed on a larger disk or empty tower
 * 3. Complete the puzzle in minimum moves!
 * 
 * Optimal moves = 2^n - 1 (where n = number of disks)
 */

import { useState, useEffect } from 'react';
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
    disks: 3,
    optimalMoves: 7,
    sparksMultiplier: 1,
  },
  medium: {
    name: 'Medium',
    color: theme.colors.neonCyan,
    disks: 4,
    optimalMoves: 15,
    sparksMultiplier: 1.5,
  },
  hard: {
    name: 'Hard',
    color: theme.colors.neonOrange,
    disks: 5,
    optimalMoves: 31,
    sparksMultiplier: 2,
  },
  extreme: {
    name: 'Extreme',
    color: theme.colors.neonPurple,
    disks: 6,
    optimalMoves: 63,
    sparksMultiplier: 3,
  },
  master: {
    name: 'Master',
    color: theme.colors.neonPink,
    disks: 7,
    optimalMoves: 127,
    sparksMultiplier: 5,
  },
};

const DISK_COLORS = [
  theme.colors.neonRed,
  theme.colors.neonOrange,
  theme.colors.neonYellow,
  theme.colors.neonGreen,
  theme.colors.neonCyan,
  theme.colors.neonPurple,
  theme.colors.neonPink,
];

const TowerOfHanoi = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [difficulty, setDifficulty] = useState('medium');
  
  const [towers, setTowers] = useState([[], [], []]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [sparksEarned, setSparksEarned] = useState(0);
  
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');

  const config = DIFFICULTY[difficulty];

  /**
   * Initialize towers
   */
  const initializeTowers = () => {
    const initialTowers = [[], [], []];
    // Place all disks on first tower (largest to smallest)
    for (let i = config.disks; i >= 1; i--) {
      initialTowers[0].push(i);
    }
    setTowers(initialTowers);
    setSelectedTower(null);
    setMoves(0);
    setGameStartTime(Date.now());
    setShowHint(false);
  };

  /**
   * Start game
   */
  const startGame = () => {
    setGameState(GAME_STATE.PLAYING);
    initializeTowers();
  };

  /**
   * Handle tower click
   */
  const handleTowerClick = (towerIndex) => {
    if (selectedTower === null) {
      // Select disk from this tower
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
        setShowHint(false);
      }
    } else {
      // Try to move disk to this tower
      if (selectedTower === towerIndex) {
        // Deselect
        setSelectedTower(null);
      } else {
        // Attempt move
        const fromTower = selectedTower;
        const toTower = towerIndex;
        
        if (isValidMove(fromTower, toTower)) {
          moveDisk(fromTower, toTower);
        } else {
          // Invalid move - show hint
          setHintMessage('❌ Cannot place larger disk on smaller disk!');
          setShowHint(true);
          setTimeout(() => setShowHint(false), 2000);
        }
        
        setSelectedTower(null);
      }
    }
  };

  /**
   * Check if move is valid
   */
  const isValidMove = (fromIndex, toIndex) => {
    const fromTower = towers[fromIndex];
    const toTower = towers[toIndex];
    
    if (fromTower.length === 0) return false;
    
    const diskToMove = fromTower[fromTower.length - 1];
    
    if (toTower.length === 0) return true;
    
    const topDiskOnTarget = toTower[toTower.length - 1];
    
    return diskToMove < topDiskOnTarget;
  };

  /**
   * Move disk
   */
  const moveDisk = (fromIndex, toIndex) => {
    const newTowers = towers.map((tower) => [...tower]);
    const disk = newTowers[fromIndex].pop();
    newTowers[toIndex].push(disk);
    
    setTowers(newTowers);
    setMoves((prev) => prev + 1);
    
    // Check if puzzle is solved
    if (newTowers[2].length === config.disks) {
      setTimeout(() => endGame(), 500);
    }
  };

  /**
   * Reset puzzle
   */
  const resetPuzzle = () => {
    initializeTowers();
  };

  /**
   * End game
   */
  const endGame = async () => {
    setGameState(GAME_STATE.RESULTS);
    
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    
    // Calculate efficiency (how close to optimal)
    const efficiency = (config.optimalMoves / moves) * 100;
    
    // Calculate score
    const baseScore = 1000;
    const efficiencyBonus = Math.floor(efficiency * 10);
    const timeBonus = Math.max(0, 500 - timeTaken);
    const totalScore = baseScore + efficiencyBonus + timeBonus;
    
    // Calculate sparks
    let sparks = Math.floor(totalScore * config.sparksMultiplier * 0.1);
    if (moves === config.optimalMoves) {
      sparks = Math.floor(sparks * 2); // Perfect solve!
    } else if (efficiency >= 90) {
      sparks = Math.floor(sparks * 1.5);
    } else if (efficiency >= 70) {
      sparks = Math.floor(sparks * 1.25);
    }
    
    setSparksEarned(sparks);
    
    // Submit to backend
    try {
      const gameData = {
        game_type: 'tower-of-hanoi',
        difficulty: difficulty,
        score: Math.round(totalScore),
        accuracy: Math.min(100, efficiency),
        time_taken: timeTaken,
      };
      
      console.log('📤 Submitting Tower of Hanoi score:', gameData);
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
            <span style={styles.gameIcon}>🗼</span>
            <h1 style={styles.gameTitle}>Tower of Hanoi</h1>
            <p style={styles.gameDesc}>
              The legendary puzzle! Move all disks from the first tower to the last tower. Plan carefully - every move counts!
            </p>
          </div>

          <div style={styles.instructions}>
            <h3 style={styles.instructionsTitle}>How to Play:</h3>
            <ul style={styles.instructionsList}>
              <li>Click a tower to select the top disk</li>
              <li>Click another tower to move the disk there</li>
              <li>You can only place smaller disks on larger disks</li>
              <li>Complete the puzzle in minimum moves!</li>
            </ul>
            <div style={styles.optimalFormula}>
              <span style={styles.formulaLabel}>Optimal Moves Formula:</span>
              <span style={styles.formulaText}>2<sup>n</sup> - 1</span>
            </div>
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
                    {diff.disks} disks • {diff.optimalMoves} optimal moves
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
            <div style={styles.moveCounter}>
              <span style={styles.moveLabel}>MOVES</span>
              <span style={styles.moveValue}>{moves}</span>
              <span style={styles.optimalValue}>Optimal: {config.optimalMoves}</span>
            </div>
            <button onClick={resetPuzzle} style={styles.resetBtn}>
              🔄 Reset
            </button>
          </div>

          {showHint && (
            <div style={styles.hintBox}>
              {hintMessage}
            </div>
          )}

          <div style={styles.towersContainer}>
            {towers.map((tower, towerIndex) => (
              <div
                key={towerIndex}
                onClick={() => handleTowerClick(towerIndex)}
                style={{
                  ...styles.towerWrapper,
                  ...(selectedTower === towerIndex ? styles.towerSelected : {}),
                }}
              >
                <div style={styles.tower}>
                  {/* Disks */}
                  <div style={styles.diskContainer}>
                    {tower.map((diskSize, diskIndex) => {
                      const width = 40 + diskSize * 30;
                      const color = DISK_COLORS[diskSize - 1] || theme.colors.neonCyan;
                      return (
                        <div
                          key={diskIndex}
                          style={{
                            ...styles.disk,
                            width: `${width}px`,
                            backgroundColor: color,
                            boxShadow: `0 0 15px ${color}`,
                          }}
                        >
                          {diskSize}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pole */}
                  <div style={styles.pole} />
                  
                  {/* Base */}
                  <div style={styles.base} />
                </div>
                
                <div style={styles.towerLabel}>
                  {towerIndex === 0 ? 'START' : towerIndex === 1 ? 'MIDDLE' : 'TARGET'}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.instructions2}>
            Click a tower to select, then click another tower to move the top disk.
          </div>
        </div>
      )}

      {/* Results */}
      {gameState === GAME_STATE.RESULTS && (
        <div style={styles.resultsCard}>
          <div style={styles.resultIcon}>
            {moves === config.optimalMoves ? '🏆' : '🎯'}
          </div>
          <h2 style={styles.resultTitle}>
            {moves === config.optimalMoves ? 'PERFECT SOLUTION!' : 'Puzzle Complete!'}
          </h2>
          
          <div style={styles.sparksBox}>
            <span>⚡</span> +{sparksEarned} Sparks
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{moves}</div>
              <div style={styles.statLabel}>YOUR MOVES</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{config.optimalMoves}</div>
              <div style={styles.statLabel}>OPTIMAL MOVES</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {((config.optimalMoves / moves) * 100).toFixed(0)}%
              </div>
              <div style={styles.statLabel}>EFFICIENCY</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {Math.floor((Date.now() - gameStartTime) / 1000)}s
              </div>
              <div style={styles.statLabel}>TIME</div>
            </div>
          </div>

          {moves === config.optimalMoves && (
            <div style={styles.perfectBox}>
              <span style={styles.perfectIcon}>🌟</span>
              <span style={styles.perfectText}>
                You solved it in the optimal number of moves!
              </span>
            </div>
          )}

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
    marginBottom: '1rem',
  },
  optimalFormula: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
  },
  formulaLabel: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
  },
  formulaText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonCyan,
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
    maxWidth: '900px',
    width: '100%',
    border: `1px solid ${theme.colors.bgTertiary}`,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  moveCounter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  moveLabel: {
    fontSize: '0.8rem',
    color: theme.colors.textMuted,
  },
  moveValue: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonCyan,
  },
  optimalValue: {
    fontSize: '0.85rem',
    color: theme.colors.textSecondary,
  },
  resetBtn: {
    padding: '0.75rem 1.5rem',
    background: theme.colors.bgPrimary,
    border: `2px solid ${theme.colors.neonOrange}`,
    borderRadius: theme.borderRadius.lg,
    color: theme.colors.neonOrange,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  hintBox: {
    textAlign: 'center',
    padding: '1rem',
    background: `${theme.colors.neonRed}22`,
    border: `2px solid ${theme.colors.neonRed}`,
    borderRadius: theme.borderRadius.lg,
    color: theme.colors.neonRed,
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  towersContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  towerWrapper: {
    cursor: 'pointer',
    padding: '1rem',
    borderRadius: theme.borderRadius.lg,
    border: `2px solid transparent`,
    transition: 'all 0.3s ease',
  },
  towerSelected: {
    borderColor: theme.colors.neonCyan,
    background: `${theme.colors.neonCyan}11`,
    boxShadow: `0 0 20px ${theme.colors.neonCyan}33`,
  },
  tower: {
    position: 'relative',
    height: '350px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  diskContainer: {
    position: 'absolute',
    bottom: '30px',
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    gap: '2px',
    zIndex: 2,
  },
  disk: {
    height: '30px',
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.colors.bgPrimary,
    transition: 'all 0.3s ease',
  },
  pole: {
    position: 'absolute',
    bottom: '20px',
    width: '8px',
    height: '300px',
    background: theme.colors.bgTertiary,
    borderRadius: '4px',
    zIndex: 1,
  },
  base: {
    width: '100%',
    height: '20px',
    background: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.md,
  },
  towerLabel: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  instructions2: {
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
    marginBottom: '1.5rem',
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
  perfectBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: `${theme.colors.neonGreen}22`,
    border: `2px solid ${theme.colors.neonGreen}`,
    borderRadius: theme.borderRadius.lg,
    marginBottom: '2rem',
  },
  perfectIcon: {
    fontSize: '1.5rem',
  },
  perfectText: {
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.colors.neonGreen,
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

export default TowerOfHanoi;
