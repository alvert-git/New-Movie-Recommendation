import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

# Ensure you have 'mysql-connector-python' installed: pip install mysql-connector-python
engine = create_engine("mysql+mysqlconnector://root@localhost/movie_recommend")

try:
    # 1. Update this to the correct filename from your Preprocessing.py
    df = pd.read_csv("movies_to_db.csv") 
    
    # 2. Fill NaN values (MySQL doesn't like 'NaN' in numeric/date columns)
    # This replaces empty cells with an empty string or 0
    df = df.fillna('') 

    print(f"Starting upload for: {df.shape[0]} movies...")
    
    CHUNK_SIZE = 100
    
    with engine.begin() as connection:
        df.to_sql(
            "movies", 
            con=connection, 
            if_exists="append", # Use "append" since you already created the table
            index=False, 
            chunksize=CHUNK_SIZE
        )
    print("🚀 Data uploaded successfully to XAMPP MySQL!")

except SQLAlchemyError as e:
    print(f"❌ Database error: {e}")
except FileNotFoundError:
    print("❌ Error: 'movies_to_db.csv' not found. Check your file path!")
except Exception as e:
    print(f"❌ An error occurred: {e}")