from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import os

# Database URL - using SQLite for simplicity (file-based database)
DATABASE_URL = "sqlite:///./ecommerce_users.db"

# Create database engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create session factory
sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    stats = relationship("UserStats", back_populates="user", uselist=False)
    game_scores = relationship("GameScore", back_populates="user")


class UserStats(Base):
    """
    User statistics using BrainForge terminology:
    - sparks: XP/points earned
    - brain_level: user's progression level
    - synapse_streak: consecutive days of training
    - mind_rating: overall performance score
    """
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # BrainForge metrics
    sparks = Column(Integer, default=0)  # XP/Points
    brain_level = Column(Integer, default=1)  # Level
    synapse_streak = Column(Integer, default=0)  # Streak (consecutive days)
    best_synapse_streak = Column(Integer, default=0)  # Best streak ever
    mind_rating = Column(Integer, default=0)  # Overall score
    
    # Activity tracking
    total_games_played = Column(Integer, default=0)
    total_time_trained = Column(Integer, default=0)  # in seconds
    last_activity_date = Column(DateTime, default=None)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="stats")


class GameScore(Base):
    """
    Individual game scores for tracking progress
    """
    __tablename__ = "game_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Game info
    game_type = Column(String, nullable=False)  # e.g., 'math_sprint', 'memory_match'
    difficulty = Column(String, default='medium')  # easy, medium, hard
    
    # Score data
    score = Column(Integer, nullable=False)
    sparks_earned = Column(Integer, default=0)
    time_taken = Column(Integer, default=0)  # in seconds
    accuracy = Column(Float, default=0.0)  # percentage
    
    # Timestamps
    played_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="game_scores")
    
Base.metadata.create_all(bind=engine)

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()