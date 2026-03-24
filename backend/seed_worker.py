import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from utils.database import SessionLocal, engine, Base
from models.user import User
from models.constituency import Constituency
from utils.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        # Check for constituency
        constituency = db.query(Constituency).first()
        if not constituency:
            print("Creating default constituency...")
            constituency = Constituency(name="Vidhya Nagar", state="Maharashtra")
            db.add(constituency)
            db.commit()
            db.refresh(constituency)
            
        worker_phone = "9876543210"
        existing_worker = db.query(User).filter(User.phone == worker_phone).first()
        
        if not existing_worker:
            print("Creating worker Amit Sharma...")
            worker = User(
                name="Amit Sharma",
                phone=worker_phone,
                email="amit@example.com",
                role="FieldWorker",
                constituency_id=constituency.id,
                hashed_password=get_password_hash("password123")
            )
            db.add(worker)
            db.commit()
            print("Worker Amit Sharma created successfully.")
        else:
            print("Worker Amit Sharma already exists.")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
