from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session, select
from datetime import datetime, timezone
from app.models import User, Badge

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'termlens.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    seed_initial_data()

def get_session():
    with Session(engine) as session:
        yield session

def seed_initial_data():
    with Session(engine) as session:
        # Check if default student exists
        statement = select(User).where(User.username == "student1")
        user = session.exec(statement).first()
        if not user:
            user = User(
                username="student1",
                xp=120,
                level=2,
                streak_days=3,
                streak_freezes=1,
                credits=25,
                daily_goal=3,
                daily_progress=1,
                last_active_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            )
            session.add(user)
            session.commit()
            session.refresh(user)

            # Starter badge
            badge = Badge(
                user_id=user.id,
                badge_id="first_step",
                title="Curious Mind",
                description="Started your AI learning journey",
                category="Milestone",
            )
            session.add(badge)
            session.commit()
