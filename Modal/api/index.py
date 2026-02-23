import os
import pickle
import pandas as pd
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)
CORS(app)

# --- 1. DATABASE CONFIGURATION ---
# Using the connection string from your successful migration
DB_URL = "mysql+mysqlconnector://root@localhost/movie_recommend"
engine = create_engine(DB_URL)

def load_data():
    try:
        # We load the data ordered by your primary key to maintain 
        # consistency with the similarity matrix index
        query = "SELECT * FROM movies" 
        df = pd.read_sql(query, con=engine)
        print("Data loaded successfully from Database")
        return df
    except Exception as e:
        print(f"Error loading from DB: {e}")
        return None

# Load the DataFrame and the Similarity Matrix
movies = load_data()
similarity = pickle.load(open('D:\\Coding\\BCA 6th Sem ProjectII\\Content-based\\Modal\\similarity.pkl', 'rb'))

# --- 2. POSTER FETCHING LOGIC ---
def fetch_poster(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"

    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            poster_path = data.get('poster_path')
            if poster_path:
                return f"https://image.tmdb.org/t/p/w500{poster_path}"
        return "https://via.placeholder.com/500x750?text=No+Poster+Found"
    except Exception as e:
        print(f"Error fetching poster for ID {movie_id}: {e}")
        return "https://via.placeholder.com/500x750?text=Error"

# --- 3. RECOMMENDATION LOGIC ---
def recommend(movie_name):
    try:
        # Find the movie index in the dataframe
        # We use case-insensitive matching just in case
        match = movies[movies['title'].str.lower() == movie_name.lower()]
        
        if match.empty:
            return None
            
        index = match.index[0]
        
        # Get similarity scores and sort them
        distances = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda x: x[1])
        
        recommendations = []
        # Get top 5 recommendations (excluding the movie itself)
        for i in distances[1:6]:
            row = movies.iloc[i[0]]
            
            recommendations.append({
                "movie_id": int(row.movie_id),
                "title": str(row.title),
                "poster_url": fetch_poster(row.movie_id)
            })
            
        return recommendations
    except Exception as e:
        print(f"Error in recommendation algorithm: {e}")
        return None

# --- 4. ROUTES ---
@app.route('/recommend', methods=['POST'])
def get_recommendations():
    data = request.get_json()
    
    if not data or 'movie_name' not in data:
        return jsonify({"error": "Missing movie_name in request body"}), 400
        
    movie_name = data.get('movie_name')
    result = recommend(movie_name)
    
    if result:
        return jsonify({
            "requested_movie": movie_name,
            "recommendations": result
        })
    else:
        return jsonify({"error": f"Movie '{movie_name}' not found in database"}), 404

# --- 5. RUN APP ---
if __name__ == '__main__':
    # Make sure your database and pkl file are ready before running
    if movies is not None:
        app.run(port=5000, debug=True)
    else:
        print("Failed to start server: Database connection error.")