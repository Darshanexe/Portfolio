/**
 * 🔄 TASK SWITCHING - BrainForge
 * 
 * Trains cognitive flexibility by forcing rapid switches between different mental rules.
 * Each trial shows a NUMBER and you must apply the current RULE:
 * 
 * - ODD/EVEN: Is the number odd or even?
 * - HIGH/LOW: Is the number above or below 5?
 * - PRIME/COMPOSITE: Is the number prime or composite?
 * 
 * The rule changes unpredictably! Stay sharp!
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
    totalTrials: 30,
    timePerTrial: 3000,
    switchProbability: 0.25, // 25% chance to switch rules
    numberRange: [1, 9],
    sparksMultiplier: 1,
  },
  medium: {
    name: 'Medium',
    color: theme.colors.neonCyan,
    totalTrials: 40,
    timePerTrial: 2500,
    switchProbability: 0.4,
    numberRange: [1, 9],
    sparksMultiplier: 1.5,
  },
  hard: {
    name: 'Hard',
    color: theme.colors.neonOrange,
    totalTrials: 50,
    timePerTrial: 2000,
    switchProbability: 0.5,
    numberRange: [1, 12],
    sparksMultiplier: 2,
  },
  extreme: {
    name: 'Extreme',
    color: theme.colors.neonPurple,
    totalTrials: 60,
    timePerTrial: 1500,
    switchProbability: 0.6,
    numberRange: [1, 15],
    sparksMultiplier: 3,
  },
};

const RULES = {
  oddEven: {
    name: 'ODD / EVEN',
    color: theme.colors.neonCyan,
    options: ['ODD', 'EVEN'],
    evaluate: (num) => (num % 2 === 1 ? 'ODD' : 'EVEN'),
  },
  highLow: {
    name: 'HIGH / LOW',
    color: theme.colors.neonPurple,
    options: ['HIGH', 'LOW'],
    evaluate: (num) => (num > 5 ? 'HIGH' : 'LOW'),
  },
  primComposite: {
    name: 'PRIME / COMPOSITE',
    color: theme.colors.neonOrange,
    options: ['PRIME', 'COMPOSITE'],
    evaluate: (num) => {
      if (num < 2) return 'COMPOSITE';
      if (num === 2) return 'PRIME';
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return 'COMPOSITE';
      }
      return 'PRIME';
    },
  },
};

const RULE_KEYS = Object.keys(RULES);

const TaskSwitching = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [difficulty, setDifficulty] = useState('medium');
  
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [currentRuleKey, setCurrentRuleKey] = useState('oddEven');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [wasSwitch, setWasSwitch] = useState(false);
  
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeouts, setTimeouts] = useState(0);
  const [switchCost, setSwitchCost] = useState(0); // Track reaction time cost of switching
  const [reactionTimes, setReactionTimes] = useState([]);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  
  const [sparksEarned, setSparksEarned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const trialStartTime = useRef(0);
  const trialTimer = useRef(null);
  const previousRuleKey = useRef('oddEven');

  const config = DIFFICULTY[difficulty];
  const currentRule = RULES[currentRuleKey];

  /**
   * Generate trial
   */
  const generateTrial = (trialNum) => {
    // Decide if rule should switch
    let newRuleKey = previousRuleKey.current;
    let isSwitch = false;
    
    if (trialNum > 0 && Math.random() < config.switchProbability) {
      // Switch to a different rule
      const otherRules = RULE_KEYS.filter((key) => key !== previousRuleKey.current);
      newRuleKey = otherRules[Math.floor(Math.random() * otherRules.length)];
      isSwitch = true;
    }
    
    setCurrentRuleKey(newRuleKey);
    setWasSwitch(isSwitch);
    previousRuleKey.current = newRuleKey;
    
    // Generate random number
    const [min, max] = config.numberRange;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    setCurrentNumber(num);
    
    // Calculate correct answer
    const answer = RULES[newRuleKey].evaluate(num);
    setCorrectAnswer(answer);
    
    trialStartTime.current = Date.now();
    
    // Set timeout
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
    setSwitchCost(0);
    previousRuleKey.current = RULE_KEYS[Math.floor(Math.random() * RULE_KEYS.length)];
    setGameStartTime(Date.now());
    setGameState(GAME_STATE.PLAYING);
    generateTrial(0);
  };

  /**
   * Handle answer
   */
  const handleAnswer = (selectedAnswer) => {
    if (showFeedback) return;
    
    clearTimeout(trialTimer.current);
    
    const reactionTime = Date.now() - trialStartTime.current;
    setReactionTimes((prev) => [...prev, { rt: reactionTime, wasSwitch }]);
    
    if (selectedAnswer === correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
      
      // Bonus points for fast responses
      const speedBonus = Math.max(0, Math.floor((config.timePerTrial - reactionTime) / 20));
      setScore((prev) => prev + 100 + speedBonus);
      
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
      generateTrial(trialIndex + 1);
    }
  };

  /**
   * Calculate switch cost (difference in RT between switch and non-switch trials)
   */
  const calculateSwitchCost = (rts) => {
    const switchRTs = rts.filter((r) => r.wasSwitch).map((r) => r.rt);
    const noSwitchRTs = rts.filter((r) => !r.wasSwitch).map((r) => r.rt);
    
    if (switchRTs.length === 0 || noSwitchRTs.length === 0) return 0;
    
    const avgSwitch = switchRTs.reduce((a, b) => a + b, 0) / switchRTs.length;
    const avgNoSwitch = noSwitchRTs.reduce((a, b) => a + b, 0) / noSwitchRTs.length;
    
    return avgSwitch - avgNoSwitch;
  };

  /**
   * End game
   */
  const endGame = async () => {
    clearTimeout(trialTimer.current);
    setGameState(GAME_STATE.RESULTS);
    
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = (correctAnswers / config.totalTrials) * 100;
    const cost = calculateSwitchCost(reactionTimes);
    setSwitchCost(cost);
    
    // Calculate sparks
    let sparks = Math.floor(score * config.sparksMultiplier * 0.08);
    if (accuracy >= 90) sparks = Math.floor(sparks * 1.5);
    else if (accuracy >= 75) sparks = Math.floor(sparks * 1.25);
    
    // Bonus for low switch cost (good cognitive flexibility!)
    if (cost < 200) sparks = Math.floor(sparks * 1.3);
    
    setSparksEarned(sparks);
    
    // Submit to backend
    try {
      const gameData = {
        game_type: 'task-switching',
        difficulty: difficulty,
        score: Math.round(score),
        accuracy: accuracy,
        time_taken: timeTaken,
      };
      
      console.log('📤 Submitting Task Switching score:', gameData);
      const result = await userAPI.submitGameScore(gameData);
      setSparksEarned(result.sparks_earned);
      console.log('✅ Score submitted:', result);
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
    }
  };

  /**
   * Cleanup
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
            <span style={styles.gameIcon}>🔄</span>
            <h1 style={styles.gameTitle}>Task Switching</h1>
            <p style={styles.gameDesc}>
              Train your mental flexibility! Switch rapidly between different rules. Stay alert - the rules change without warning!
            </p>
          </div>

          <div style={styles.instructions}>
            <h3 style={styles.instructionsTitle}>How to Play:</h3>
            <div style={styles.rulesPreview}>
              {Object.entries(RULES).map(([key, rule]) => (
                <div key={key} style={styles.ruleExample}>
                  <span style={{ ...styles.ruleName, color: rule.color }}>
                    {rule.name}
                  </span>
                  <span style={styles.ruleOptions}>
                    {rule.options.join(' or ')}
                  </span>
                </div>
              ))}
            </div>
            <ul style={styles.instructionsList}>
              <li>A number appears with the current RULE</li>
              <li>Apply the rule and click the correct answer</li>
              <li>Rules switch unpredictably - stay flexible!</li>
              <li>Be fast and accurate</li>
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
                    {diff.totalTrials} trials • {(diff.timePerTrial / 1000).toFixed(1)}s each • {(diff.switchProbability * 100)}% switch rate
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

          <div style={{
            ...styles.ruleIndicator,
            backgroundColor: `${currentRule.color}22`,
            borderColor: currentRule.color,
            ...(wasSwitch ? styles.ruleSwitched : {}),
          }}>
            <div style={styles.ruleLabel}>CURRENT RULE</div>
            <div style={{ ...styles.ruleTitle, color: currentRule.color }}>
              {currentRule.name}
            </div>
            {wasSwitch && (
              <div style={styles.switchBadge}>⚠️ SWITCHED!</div>
            )}
          </div>

          <div style={styles.numberDisplay}>
            <div 
              style={{
                ...styles.numberLarge,
                ...(showFeedback && feedbackType === 'correct' ? styles.feedbackCorrect : {}),
                ...(showFeedback && feedbackType === 'wrong' ? styles.feedbackWrong : {}),
                ...(showFeedback && feedbackType === 'timeout' ? styles.feedbackTimeout : {}),
              }}
            >
              {currentNumber}
            </div>
            
            {showFeedback && (
              <div style={styles.feedbackText}>
                {feedbackType === 'correct' && '✓ Correct!'}
                {feedbackType === 'wrong' && `✗ Wrong! (${correctAnswer})`}
                {feedbackType === 'timeout' && '⏱️ Too slow!'}
              </div>
            )}
          </div>

          <div style={styles.answerOptions}>
            {currentRule.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
                style={{
                  ...styles.answerBtn,
                  opacity: showFeedback ? 0.5 : 1,
                  borderColor: currentRule.color,
                }}
              >
                {option}
              </button>
            ))}
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
              <div style={styles.statValue}>
                {((correctAnswers / config.totalTrials) * 100).toFixed(0)}%
              </div>
              <div style={styles.statLabel}>ACCURACY</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {switchCost >= 0 ? `+${Math.round(switchCost)}ms` : `${Math.round(switchCost)}ms`}
              </div>
              <div style={styles.statLabel}>SWITCH COST</div>
            </div>
          </div>

          <div style={styles.flexibilityScore}>
            <span style={styles.flexLabel}>Cognitive Flexibility:</span>
            <span style={styles.flexValue}>
              {switchCost < 200 ? '🌟 Excellent!' : switchCost < 400 ? '✨ Good!' : '💪 Keep training!'}
            </span>
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
  rulesPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  ruleExample: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
  },
  ruleName: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  ruleOptions: {
    fontSize: '0.9rem',
    color: theme.colors.textMuted,
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
    maxWidth: '700px',
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
  scoreDisplay: {
    color: theme.colors.neonGreen,
    fontFamily: theme.fonts.mono,
  },
  ruleIndicator: {
    textAlign: 'center',
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    border: '2px solid',
    marginBottom: '2rem',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  ruleSwitched: {
    animation: 'pulse 0.5s ease',
  },
  ruleLabel: {
    fontSize: '0.8rem',
    color: theme.colors.textMuted,
    marginBottom: '0.5rem',
  },
  ruleTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: theme.fonts.primary,
  },
  switchBadge: {
    position: 'absolute',
    top: '-10px',
    right: '1rem',
    background: theme.colors.neonOrange,
    color: theme.colors.bgPrimary,
    padding: '0.25rem 0.75rem',
    borderRadius: theme.borderRadius.full,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  numberDisplay: {
    textAlign: 'center',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  numberLarge: {
    fontSize: '6rem',
    fontWeight: 700,
    fontFamily: theme.fonts.mono,
    color: theme.colors.neonCyan,
    textShadow: `0 0 30px ${theme.colors.neonCyan}`,
    transition: 'all 0.2s ease',
  },
  feedbackCorrect: {
    transform: 'scale(1.2)',
    color: theme.colors.neonGreen,
    textShadow: `0 0 40px ${theme.colors.neonGreen}`,
  },
  feedbackWrong: {
    transform: 'scale(0.8)',
    color: theme.colors.neonRed,
    textShadow: `0 0 40px ${theme.colors.neonRed}`,
  },
  feedbackTimeout: {
    opacity: 0.3,
  },
  feedbackText: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: '1rem',
    color: theme.colors.textPrimary,
  },
  answerOptions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  answerBtn: {
    padding: '1.5rem',
    background: theme.colors.bgPrimary,
    border: '2px solid',
    borderRadius: theme.borderRadius.lg,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  flexibilityScore: {
    background: theme.colors.bgPrimary,
    borderRadius: theme.borderRadius.lg,
    padding: '1rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  flexLabel: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
  },
  flexValue: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.colors.neonPurple,
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

export default TaskSwitching;
