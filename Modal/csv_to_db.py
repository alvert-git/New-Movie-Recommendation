# import pymysql
# import pandas as pd
# from sqlalchemy import create_engine
# from sqlalchemy import URL


# # url_object = URL.create(
# #     "mysql",
# #     username="root",
# #     password="",
# #     host="localhost",
# #     database="flight_db",
# # )
# # engine = create_engine(url_object)

# engine = create_engine(
#     "mysql+mysqlconnector://root@localhost/movie_recommend"
# )

# df = pd.read_csv("final_movie_data.csv")
# print(df.shape)
# CHUNK_SIZE = 1000
# df.to_sql("movies",con=engine,if_exists="append",chunksize=CHUNK_SIZE )


import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

# Connection string
engine = create_engine("mysql+mysqlconnector://root@localhost/movie_recommend")

try:
    df = pd.read_csv("final_movie_data.csv")
    print(f"Shape of data: {df.shape}")
    
    CHUNK_SIZE = 100
    
    # 1. Added index=False to prevent index column errors
    # 2. Wrapped in a 'with' block to ensure the connection closes properly
    with engine.begin() as connection:
        df.to_sql(
            "movies", 
            con=connection, 
            if_exists="append", 
            index=False, 
            chunksize=CHUNK_SIZE
        )
    print("Data uploaded successfully!")

except SQLAlchemyError as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"An error occurred: {e}")