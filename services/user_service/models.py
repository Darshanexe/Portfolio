from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

#Request Models (what users send to API)
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
#Response Models (what API sends back)
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True
        
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None


# ============== BRAINFORGE STATS MODELS ==============

class UserStatsResponse(BaseModel):
    """User statistics with BrainForge terminology"""
    sparks: int  # XP/Points
    brain_level: int  # Level
    synapse_streak: int  # Current streak
    best_synapse_streak: int  # Best streak ever
    mind_rating: int  # Overall score
    total_games_played: int
    total_time_trained: int  # in seconds
    last_activity_date: Optional[datetime]
    
    class Config:
        from_attributes = True


class GameScoreCreate(BaseModel):
    """Submit a game score"""
    game_type: str  # e.g., 'math-sprint'
    difficulty: str  # easy, medium, hard
    score: int
    time_taken: int  # in seconds
    accuracy: float  # percentage (0-100)
    questions_answered: Optional[int] = None
    correct_answers: Optional[int] = None
    best_streak: Optional[int] = None


class GameScoreResponse(BaseModel):
    """Game score response"""
    id: int
    game_type: str
    difficulty: str
    score: int
    sparks_earned: int
    time_taken: int
    accuracy: float
    played_at: datetime
    
    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    """Leaderboard entry"""
    rank: int
    username: str
    mind_rating: int
    brain_level: int
    sparks: int


class GameHistoryResponse(BaseModel):
    """User's game history"""
    games: List[GameScoreResponse]
    total_count: int