/**
 * 📝 WORD LOGIC GAME - BrainForge
 * 
 * A logical reasoning game using words and deduction.
 * Players solve logic puzzles involving word relationships, categories, and deduction.
 * 
 * PUZZLE TYPES:
 * 1. Odd One Out - Find the word that doesn't belong
 * 2. Category Match - Identify the common category
 * 3. Logic Chains - Deduce relationships (A is to B as C is to ?)
 * 4. Word Associations - Find the connecting word
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
    timePerQuestion: 20,
    questionsCount: 8,
    sparksMultiplier: 1,
  },
  medium: {
    name: 'Medium',
    color: theme.colors.neonCyan,
    timePerQuestion: 15,
    questionsCount: 10,
    sparksMultiplier: 1.5,
  },
  hard: {
    name: 'Hard',
    color: theme.colors.neonOrange,
    timePerQuestion: 12,
    questionsCount: 12,
    sparksMultiplier: 2,
  },
};

// Puzzle database
const PUZZLES = {
  easy: [
    {
      type: 'odd-one-out',
      question: 'Which word doesn\'t belong?',
      options: ['Apple', 'Banana', 'Carrot', 'Orange'],
      answer: 'Carrot',
      explanation: 'Carrot is a vegetable, the others are fruits.',
    },
    {
      type: 'analogy',
      question: 'Hot is to Cold as Day is to ___?',
      options: ['Night', 'Sun', 'Light', 'Morning'],
      answer: 'Night',
      explanation: 'Hot and Cold are opposites, as are Day and Night.',
    },
    {
      type: 'category',
      question: 'What category do these belong to: Dog, Cat, Elephant?',
      options: ['Pets', 'Animals', 'Mammals', 'Living Things'],
      answer: 'Mammals',
      explanation: 'All are mammals (warm-blooded vertebrates).',
    },
    {
      type: 'odd-one-out',
      question: 'Which doesn\'t fit: Car, Bicycle, Train, Chair?',
      options: ['Car', 'Bicycle', 'Train', 'Chair'],
      answer: 'Chair',
      explanation: 'Chair is not a vehicle.',
    },
    {
      type: 'analogy',
      question: 'Book is to Read as Music is to ___?',
      options: ['Listen', 'Song', 'Sound', 'Play'],
      answer: 'Listen',
      explanation: 'You read books and listen to music.',
    },
    {
      type: 'odd-one-out',
      question: 'Find the odd one: Red, Blue, Green, Circle?',
      options: ['Red', 'Blue', 'Green', 'Circle'],
      answer: 'Circle',
      explanation: 'Circle is a shape, others are colors.',
    },
    {
      type: 'analogy',
      question: 'Hand is to Glove as Foot is to ___?',
      options: ['Shoe', 'Leg', 'Walk', 'Toe'],
      answer: 'Shoe',
      explanation: 'Gloves are worn on hands, shoes on feet.',
    },
    {
      type: 'category',
      question: 'What connects: January, March, December?',
      options: ['Seasons', 'Months', 'Holidays', 'Calendar'],
      answer: 'Months',
      explanation: 'All are months of the year.',
    },
  ],
  medium: [
    {
      type: 'odd-one-out',
      question: 'Which doesn\'t belong: Mercury, Venus, Earth, Jupiter, Sun?',
      options: ['Mercury', 'Venus', 'Earth', 'Sun'],
      answer: 'Sun',
      explanation: 'Sun is a star, others are planets.',
    },
    {
      type: 'analogy',
      question: 'Author is to Book as Composer is to ___?',
      options: ['Symphony', 'Music', 'Orchestra', 'Instrument'],
      answer: 'Symphony',
      explanation: 'Authors write books, composers write symphonies.',
    },
    {
      type: 'logic-chain',
      question: 'If all roses are flowers, and all flowers need water, then:',
      options: ['All roses need water', 'Some roses need water', 'Roses are water', 'Water is a flower'],
      answer: 'All roses need water',
      explanation: 'Logical deduction: roses → flowers → need water.',
    },
    {
      type: 'odd-one-out',
      question: 'Find the odd: Python, Java, HTML, C++?',
      options: ['Python', 'Java', 'HTML', 'C++'],
      answer: 'HTML',
      explanation: 'HTML is a markup language, others are programming languages.',
    },
    {
      type: 'analogy',
      question: 'Painter is to Canvas as Sculptor is to ___?',
      options: ['Marble', 'Museum', 'Art', 'Brush'],
      answer: 'Marble',
      explanation: 'Painters work on canvas, sculptors work on marble/stone.',
    },
    {
      type: 'logic-chain',
      question: 'If some birds can fly, and penguins are birds, then:',
      options: ['All penguins can fly', 'Some penguins can fly', 'Penguins might not fly', 'Birds cannot fly'],
      answer: 'Penguins might not fly',
      explanation: '"Some birds" doesn\'t mean all birds can fly.',
    },
    {
      type: 'odd-one-out',
      question: 'Which is different: Square, Triangle, Circle, Cube?',
      options: ['Square', 'Triangle', 'Circle', 'Cube'],
      answer: 'Cube',
      explanation: 'Cube is 3D, others are 2D shapes.',
    },
    {
      type: 'category',
      question: 'What connects: Democracy, Monarchy, Republic?',
      options: ['Countries', 'Governments', 'Leaders', 'Systems'],
      answer: 'Governments',
      explanation: 'All are forms of government.',
    },
    {
      type: 'analogy',
      question: 'Keyboard is to Computer as Steering Wheel is to ___?',
      options: ['Car', 'Road', 'Driver', 'Engine'],
      answer: 'Car',
      explanation: 'Input devices for their respective machines.',
    },
    {
      type: 'logic-chain',
      question: 'If no cats are dogs, and some pets are cats, then:',
      options: ['Some pets are not dogs', 'All pets are dogs', 'No pets are dogs', 'Cats are not pets'],
      answer: 'Some pets are not dogs',
      explanation: 'Since some pets are cats, and cats aren\'t dogs.',
    },
  ],
  hard: [
    {
      type: 'logic-chain',
      question: 'If all A are B, no B are C, then all A are definitely:',
      options: ['Not C', 'C', 'B and C', 'None of these'],
      answer: 'Not C',
      explanation: 'If A⊂B and B∩C=∅, then A∩C=∅',
    },
    {
      type: 'odd-one-out',
      question: 'Find the outlier: Metaphor, Simile, Alliteration, Algorithm?',
      options: ['Metaphor', 'Simile', 'Alliteration', 'Algorithm'],
      answer: 'Algorithm',
      explanation: 'Algorithm is computational, others are literary devices.',
    },
    {
      type: 'analogy',
      question: 'Photosynthesis is to Plants as Respiration is to ___?',
      options: ['Animals', 'Oxygen', 'Lungs', 'Breathing'],
      answer: 'Animals',
      explanation: 'Energy processes: photosynthesis for plants, respiration for animals.',
    },
    {
      type: 'logic-chain',
      question: 'If today is Tuesday, and the meeting is 4 days after tomorrow:',
      options: ['Sunday', 'Saturday', 'Friday', 'Monday'],
      answer: 'Sunday',
      explanation: 'Tomorrow=Wed, +4 days = Sunday.',
    },
    {
      type: 'odd-one-out',
      question: 'Which doesn\'t fit: Meter, Kilogram, Second, Celsius?',
      options: ['Meter', 'Kilogram', 'Second', 'Celsius'],
      answer: 'Celsius',
      explanation: 'Celsius is not an SI base unit (Kelvin is).',
    },
    {
      type: 'analogy',
      question: 'Syntax is to Language as Grammar is to ___?',
      options: ['Speech', 'Writing', 'Communication', 'Rules'],
      answer: 'Speech',
      explanation: 'Syntax governs language structure, grammar governs speech.',
    },
    {
      type: 'logic-chain',
      question: 'If A>B, B=C, and C<D, which is true?',
      options: ['A>D', 'A<D', 'A=D', 'Cannot determine'],
      answer: 'Cannot determine',
      explanation: 'A>B=C<D: relationship between A and D is unknown.',
    },
    {
      type: 'odd-one-out',
      question: 'Find the odd: Hydrogen, Helium, Oxygen, Carbon?',
      options: ['Hydrogen', 'Helium', 'Oxygen', 'Carbon'],
      answer: 'Helium',
      explanation: 'Helium is a noble gas (inert), others are reactive.',
    },
    {
      type: 'analogy',
      question: 'DNA is to Genetics as Binary is to ___?',
      options: ['Computing', 'Mathematics', 'Numbers', 'Logic'],
      answer: 'Computing',
      explanation: 'DNA is the language of genetics, binary of computing.',
    },
    {
      type: 'logic-chain',
      question: 'If some X are Y, and all Y are Z, then:',
      options: ['Some X are Z', 'All X are Z', 'No X are Z', 'X equals Y'],
      answer: 'Some X are Z',
      explanation: 'Transitive property: some X→Y→Z.',
    },
    {
      type: 'category',
      question: 'What unites: Hegelian, Socratic, Aristotelian?',
      options: ['Methods', 'Philosophers', 'Dialectics', 'Logic systems'],
      answer: 'Logic systems',
      explanation: 'All are philosophical logic/reasoning systems.',
    },
    {
      type: 'odd-one-out',
      question: 'Which differs: Sonnet, Haiku, Algorithm, Limerick?',
      options: ['Sonnet', 'Haiku', 'Algorithm', 'Limerick'],
      answer: 'Algorithm',
      explanation: 'Algorithm is procedural, others are poetic forms.',
    },
  ],
};

const WordLogic = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [difficulty, setDifficulty] = useState('medium');
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [sparksEarned, setSparksEarned] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  const config = DIFFICULTY[difficulty];

  /**
   * Shuffle and select questions
   */
  const prepareQuestions = () => {
    const puzzles = [...PUZZLES[difficulty]];
    const shuffled = puzzles.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, config.questionsCount);
  };

  /**
   * Start game
   */
  const startGame = () => {
    const selectedQuestions = prepareQuestions();
    setQuestions(selectedQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(config.timePerQuestion);
    setGameStartTime(Date.now());
    setGameState(GAME_STATE.PLAYING);
  };

  /**
   * Timer
   */
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING && !isAnswered && timeLeft > 0 && questions.length > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && questions.length > 0) {
      // Time's up - auto submit wrong answer
      handleAnswer(null);
    }
  }, [gameState, timeLeft, isAnswered, questions.length]);

  /**
   * Handle answer selection
   */
  const handleAnswer = (answer) => {
    if (isAnswered || !questions[currentQuestion]) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentQ = questions[currentQuestion];
    const isCorrect = answer === currentQ.answer;
    
    if (isCorrect) {
      const timeBonus = timeLeft * 10;
      const questionScore = 100 + timeBonus;
      setScore((prev) => prev + questionScore);
      setCorrectAnswers((prev) => prev + 1);
    }
    
    // Move to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(config.timePerQuestion);
      } else {
        endGame();
      }
    }, 2000);
  };

  /**
   * End game and submit score
   */
  const endGame = async () => {
    setGameState(GAME_STATE.RESULTS);
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    
    // Calculate sparks
    const baseSparks = Math.floor(score * 0.1);
    let sparks = Math.floor(baseSparks * config.sparksMultiplier);
    if (accuracy >= 90) sparks = Math.floor(sparks * 1.5);
    else if (accuracy >= 75) sparks = Math.floor(sparks * 1.25);
    
    setSparksEarned(sparks);
    
    // Submit to backend
    try {
      const gameData = {
        game_type: 'word-logic',
        difficulty: difficulty,
        score: score,
        accuracy: accuracy,
        time_taken: timeTaken,
      };
      
      console.log('📤 Submitting Word Logic score:', gameData);
      const result = await userAPI.submitGameScore(gameData);
      setSparksEarned(result.sparks_earned);
      console.log('✅ Score submitted:', result);
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div style={styles.container}>
      {/* Menu */}
      {gameState === GAME_STATE.MENU && (
        <div style={styles.menuCard}>
          <div style={styles.menuHeader}>
            <span style={styles.gameIcon}>📝</span>
            <h1 style={styles.gameTitle}>Word Logic</h1>
            <p style={styles.gameDesc}>
              Solve logical reasoning puzzles using words and deduction. Train your analytical thinking!
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
                    {diff.questionsCount} questions • {diff.timePerQuestion}s each
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
      {gameState === GAME_STATE.PLAYING && currentQ && (
        <div style={styles.gameArea}>
          <div style={styles.topBar}>
            <div style={styles.questionCounter}>
              Question {currentQuestion + 1} / {questions.length}
            </div>
            <div style={styles.timer} style={{
              ...styles.timer,
              color: timeLeft <= 5 ? theme.colors.neonRed : theme.colors.neonCyan,
            }}>
              ⏱️ {timeLeft}s
            </div>
            <div style={styles.scoreDisplay}>
              Score: {score}
            </div>
          </div>

          <div style={styles.questionCard}>
            <div style={styles.puzzleType}>
              {currentQ.type.replace('-', ' ').toUpperCase()}
            </div>
            <h2 style={styles.question}>{currentQ.question}</h2>

            <div style={styles.optionsGrid}>
              {currentQ.options.map((option, index) => {
                let optionStyle = { ...styles.option };
                
                if (isAnswered) {
                  if (option === currentQ.answer) {
                    optionStyle = { ...optionStyle, ...styles.optionCorrect };
                  } else if (option === selectedAnswer) {
                    optionStyle = { ...optionStyle, ...styles.optionWrong };
                  }
                } else if (selectedAnswer === option) {
                  optionStyle = { ...optionStyle, ...styles.optionSelected };
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    style={optionStyle}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div style={styles.explanation}>
                <div style={styles.explanationIcon}>
                  {selectedAnswer === currentQ.answer ? '✅' : '❌'}
                </div>
                <p style={styles.explanationText}>{currentQ.explanation}</p>
              </div>
            )}
          </div>
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
              <div style={styles.statValue}>{correctAnswers} / {questions.length}</div>
              <div style={styles.statLabel}>CORRECT</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0}%
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
    maxWidth: '800px',
    width: '100%',
    border: `1px solid ${theme.colors.bgTertiary}`,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    fontSize: '1rem',
    fontWeight: 600,
  },
  questionCounter: {
    color: theme.colors.textSecondary,
  },
  timer: {
    fontSize: '1.25rem',
    fontFamily: theme.fonts.mono,
  },
  scoreDisplay: {
    color: theme.colors.neonGreen,
  },
  questionCard: {
    background: theme.colors.bgPrimary,
    borderRadius: theme.borderRadius.lg,
    padding: '2rem',
  },
  puzzleType: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: theme.colors.neonCyan,
    marginBottom: '1rem',
  },
  question: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '2rem',
    lineHeight: 1.4,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  option: {
    background: theme.colors.bgSecondary,
    border: `2px solid ${theme.colors.bgTertiary}`,
    borderRadius: theme.borderRadius.md,
    padding: '1rem',
    fontSize: '1rem',
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  },
  optionSelected: {
    borderColor: theme.colors.neonCyan,
    background: `${theme.colors.neonCyan}22`,
  },
  optionCorrect: {
    borderColor: theme.colors.neonGreen,
    background: `${theme.colors.neonGreen}22`,
    boxShadow: `0 0 20px ${theme.colors.neonGreen}33`,
  },
  optionWrong: {
    borderColor: theme.colors.neonRed,
    background: `${theme.colors.neonRed}22`,
  },
  explanation: {
    background: `${theme.colors.neonCyan}11`,
    border: `1px solid ${theme.colors.neonCyan}33`,
    borderRadius: theme.borderRadius.md,
    padding: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  explanationIcon: {
    fontSize: '1.5rem',
  },
  explanationText: {
    fontSize: '0.95rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.5,
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

export default WordLogic;
