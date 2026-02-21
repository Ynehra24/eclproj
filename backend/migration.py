from dotenv import load_dotenv
load_dotenv()

from database import engine, SessionLocal
from sqlalchemy import text

def run_migration():
    print(f"Starting database migration on {engine.url}...")
    
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN exp INTEGER DEFAULT 0;"))
            print("Successfully added 'exp' column to users table.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("'exp' column already exists, skipping.")
            else:
                print(f"Error adding 'exp' column: {e}")

    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR;"))
            print("Successfully added 'profile_picture' column to users table.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("'profile_picture' column already exists, skipping.")
            else:
                print(f"Error adding 'profile_picture' column: {e}")
                
    print("Migration complete.")

if __name__ == "__main__":
    run_migration()
