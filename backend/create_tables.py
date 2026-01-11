from app.database import engine
from app.models import Base

def create_tables():
    print("Creating tables in PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()
