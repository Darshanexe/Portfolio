from datetime import timedelta, datetime
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from . import models, database, auth
from .database import get_db, User, UserStats, GameScore
from typing import List
from .auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

# Initialize FastAPI app for User Service
app = FastAPI(
    title="User Service",
    description="Handles user registration, authentication, and profile management",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utility functions
import hashlib
import secrets

def hash_password(password: str) -> str:
    """Convert plain password to hashed password using SHA-256"""
    # Generate a random salt
    salt = secrets.token_hex(16)
    # Hash password with salt
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    # Return salt + hash (we'll need salt for verification)
    return f"{salt}:{hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if plain password matches hashed password"""
    try:
        # Split salt and hash
        salt, stored_hash = hashed_password.split(':')
        # Hash the plain password with the same salt
        test_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        # Compare hashes
        return test_hash == stored_hash
    except ValueError:
        return False

# API Endpoints

@app.post("/register", response_model=models.UserResponse)
async def register_user(user: models.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if username already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists  
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user with hashed password
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hash_password(user.password)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/login", response_model=models.Token)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login user and return JWT token
    
    OAuth2PasswordRequestForm expects:
    - username (we'll use email)
    - password
    """
    
    # Find user by email (using username field from form)
    db_user = db.query(User).filter(User.email == form_data.username).first()
    
    # Verify user exists and password is correct
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)},  # "sub" is standard JWT field for user identifier
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/users", response_model=List[models.UserResponse])
async def get_all_users(db: Session = Depends(get_db)):
    """Get all users (for testing purposes)"""
    users = db.query(User).all()
    return users

@app.get("/users/{user_id}", response_model=models.UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get specific user by ID"""
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return db_user

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "user_service"}


@app.get("/platform/stats")
async def get_platform_stats(db: Session = Depends(get_db)):
    """
    Get real platform statistics
    Public endpoint - no auth required
    """
    total_users = db.query(User).count()
    total_games_played = db.query(GameScore).count()
    total_sparks = db.query(func.sum(UserStats.sparks)).scalar() or 0
    
    # Format numbers for display
    def format_stat(num):
        if num >= 1000000:
            return f"{num/1000000:.1f}M+"
        elif num >= 1000:
            return f"{num/1000:.1f}K+"
        else:
            return str(num)
    
    return {
        "active_players": format_stat(total_users),
        "games_played": format_stat(total_games_played),
        "sparks_earned": format_stat(int(total_sparks)),
        "raw_counts": {
            "users": total_users,
            "games": total_games_played,
            "sparks": int(total_sparks)
        }
    }


@app.get("/profile", response_model=models.UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Get current logged-in user's profile
    
    Protected endpoint - requires valid JWT token
    """
    return current_user

@app.put("/profile", response_model=models.UserResponse)
async def update_my_profile(
    full_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile
    
    Protected endpoint - requires valid JWT token
    """
    current_user.full_name = full_name
    db.commit()
    db.refresh(current_user)
    
    return current_user

@app.delete("/profile")
async def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user's account
    
    Protected endpoint - requires valid JWT token
    """
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}


# ============== BRAINFORGE STATS ENDPOINTS ==============

def get_or_create_user_stats(user_id: int, db: Session) -> UserStats:
    """Get user stats or create if doesn't exist"""
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


def calculate_sparks(score: int, difficulty: str, accuracy: float) -> int:
    """Calculate sparks earned based on performance"""
    base_sparks = max(score // 10, 10)  # Minimum 10 sparks for playing
    
    # Difficulty multiplier
    multipliers = {'easy': 1.0, 'medium': 1.5, 'hard': 2.0, 'expert': 3.0}
    multiplier = multipliers.get(difficulty, 1.0)
    
    # Accuracy bonus (up to 50% extra)
    accuracy_bonus = 1 + (accuracy / 200)
    
    sparks = int(base_sparks * multiplier * accuracy_bonus)
    
    # Ensure minimum sparks earned
    return max(sparks, 10)


def calculate_brain_level(sparks: int) -> int:
    """Calculate brain level based on total sparks"""
    # Level formula: each level requires more sparks
    # Level 1: 0, Level 2: 100, Level 3: 300, Level 4: 600, etc.
    level = 1
    required = 0
    increment = 100
    
    while sparks >= required:
        level += 1
        required += increment
        increment += 50
    
    return level - 1


def update_synapse_streak(stats: UserStats, db: Session):
    """Update the synapse streak (consecutive days)"""
    today = datetime.utcnow().date()
    
    if stats.last_activity_date:
        last_date = stats.last_activity_date.date()
        days_diff = (today - last_date).days
        
        if days_diff == 1:
            # Consecutive day - increase streak
            stats.synapse_streak += 1
        elif days_diff > 1:
            # Streak broken - reset
            stats.synapse_streak = 1
        # If same day, don't change streak
    else:
        # First activity
        stats.synapse_streak = 1
    
    # Update best streak if current is higher
    if stats.synapse_streak > stats.best_synapse_streak:
        stats.best_synapse_streak = stats.synapse_streak
    
    stats.last_activity_date = datetime.utcnow()
    db.commit()


@app.get("/stats", response_model=models.UserStatsResponse)
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's BrainForge stats"""
    stats = get_or_create_user_stats(current_user.id, db)
    return stats


@app.post("/games/score", response_model=models.GameScoreResponse)
async def submit_game_score(
    score_data: models.GameScoreCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a game score and update user stats
    
    Returns the saved score with sparks earned
    """
    print(f"📊 Submitting game score for user {current_user.username}")
    print(f"   Game: {score_data.game_type}, Difficulty: {score_data.difficulty}")
    print(f"   Score: {score_data.score}, Accuracy: {score_data.accuracy}%")
    
    try:
        # Calculate sparks earned
        sparks_earned = calculate_sparks(
            score_data.score, 
            score_data.difficulty, 
            score_data.accuracy
        )
        
        print(f"   ⚡ Sparks calculated: {sparks_earned}")
        
        # Create game score record
        game_score = GameScore(
            user_id=current_user.id,
            game_type=score_data.game_type,
            difficulty=score_data.difficulty,
            score=score_data.score,
            sparks_earned=sparks_earned,
            time_taken=score_data.time_taken,
            accuracy=score_data.accuracy
        )
        
        db.add(game_score)
        
        # Update user stats
        stats = get_or_create_user_stats(current_user.id, db)
        old_sparks = stats.sparks
        stats.sparks += sparks_earned
        stats.total_games_played += 1
        stats.total_time_trained += score_data.time_taken
        
        # Update mind rating (weighted average of recent scores)
        stats.mind_rating = int((stats.mind_rating * 0.7) + (score_data.score * 0.3))
        
        # Update best streak if this game's streak is better
        if score_data.best_streak and score_data.best_streak > stats.best_synapse_streak:
            stats.best_synapse_streak = score_data.best_streak
            print(f"   🏆 New best streak record: {score_data.best_streak}!")
        
        # Recalculate brain level
        stats.brain_level = calculate_brain_level(stats.sparks)
        
        # Update synapse streak
        update_synapse_streak(stats, db)
        
        db.commit()
        db.refresh(game_score)
        
        print(f"   ✅ Success! Sparks: {old_sparks} → {stats.sparks} (+{sparks_earned})")
        print(f"   📈 Level: {stats.brain_level}, Games: {stats.total_games_played}")
        
        return game_score
        
    except Exception as e:
        print(f"   ❌ Error submitting score: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit score: {str(e)}")


@app.get("/games/history", response_model=models.GameHistoryResponse)
async def get_game_history(
    game_type: str = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's game history"""
    query = db.query(GameScore).filter(GameScore.user_id == current_user.id)
    
    if game_type:
        query = query.filter(GameScore.game_type == game_type)
    
    games = query.order_by(desc(GameScore.played_at)).limit(limit).all()
    total = query.count()
    
    return {"games": games, "total_count": total}


@app.get("/games/best/{game_type}")
async def get_best_score(
    game_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's best score for a specific game"""
    best = db.query(GameScore).filter(
        GameScore.user_id == current_user.id,
        GameScore.game_type == game_type
    ).order_by(desc(GameScore.score)).first()
    
    if not best:
        return {"best_score": 0, "game_type": game_type}
    
    return {
        "best_score": best.score,
        "difficulty": best.difficulty,
        "accuracy": best.accuracy,
        "played_at": best.played_at,
        "game_type": game_type
    }


@app.get("/leaderboard", response_model=List[models.LeaderboardEntry])
async def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get global leaderboard by Mind Rating"""
    # Get top users by mind_rating
    top_stats = db.query(UserStats).order_by(desc(UserStats.mind_rating)).limit(limit).all()
    
    leaderboard = []
    for rank, stats in enumerate(top_stats, 1):
        user = db.query(User).filter(User.id == stats.user_id).first()
        if user:
            leaderboard.append({
                "rank": rank,
                "username": user.username,
                "mind_rating": stats.mind_rating,
                "brain_level": stats.brain_level,
                "sparks": stats.sparks
            })
    
    return leaderboard

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)