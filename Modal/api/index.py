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
similarity_path = os.path.join(os.path.dirname(__file__), '..', 'similarity.pkl')
similarity = pickle.load(open(similarity_path, 'rb'))

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

# --- 4. PERSONALIZED RECOMMENDATION LOGIC (HYBRID) ---
def get_trending(limit=5):
    try:
        # Simple trending based on total purchases and highest ratings in our movies table
        # If we had a ratings average in DB, we'd use it. For now, since it's simple, 
        # let's just pick top movies by some criteria or random top ones for now to simulate trending.
        # Ideally: SELECT m.* FROM movies m JOIN (SELECT movie_id, COUNT(*) as c FROM purchases GROUP BY movie_id) p ON m.movie_id = p.movie_id ORDER BY p.c DESC
        
        query = """
            SELECT m.*, COALESCE(p.purchase_count, 0) as p_count 
            FROM movies m 
            LEFT JOIN (SELECT movie_id, COUNT(*) as purchase_count FROM purchases WHERE status = 'COMPLETED' GROUP BY movie_id) p 
            ON m.movie_id = p.movie_id 
            ORDER BY p_count DESC, m.id ASC 
            LIMIT %s
        """
        df_trending = pd.read_sql(query, con=engine, params=(limit,))
        
        trending = []
        for _, row in df_trending.iterrows():
            trending.append({
                "movie_id": int(row.movie_id),
                "title": str(row.title),
                "poster_url": fetch_poster(row.movie_id)
            })
        return trending
    except Exception as e:
        print(f"Error fetching trending: {e}")
        return []

def recommend_for_user(user_id):
    try:
        # 1. Fetch user interactions
        query = "SELECT movie_id, interaction_type FROM user_interactions WHERE user_id = %s"
        interactions = pd.read_sql(query, con=engine, params=(user_id,))
        
        if interactions.empty:
            return get_trending()

        # 2. Define weights
        weights = {'PURCHASE': 5, 'WATCHLIST': 4, 'VIEW': 1}
        
        # 3. Calculate scores based on content similarity
        # We'll sum up similarity scores of all movies similar to the ones user interacted with, 
        # weighted by interaction type.
        
        movie_scores = {} # movie_index -> score
        interacted_movie_ids = set(interactions['movie_id'].tolist())
        
        for _, row in interactions.iterrows():
            m_id = row.movie_id
            m_type = row.interaction_type
            weight = weights.get(m_type, 1)
            
            # Find index of this movie
            match = movies[movies['movie_id'] == m_id]
            if match.empty: continue
            idx = match.index[0]
            
            # Get similarity scores for this movie
            sim_scores = similarity[idx]
            
            for i, score in enumerate(sim_scores):
                if i not in movie_scores:
                    movie_scores[i] = 0
                movie_scores[i] += score * weight
        
        # 4. Sort and filter
        sorted_scores = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)
        
        recommendations = []
        for i, score in sorted_scores:
            row = movies.iloc[i]
            if row.movie_id in interacted_movie_ids:
                continue
            
            recommendations.append({
                "movie_id": int(row.movie_id),
                "title": str(row.title),
                "poster_url": fetch_poster(row.movie_id)
            })
            
            if len(recommendations) >= 5:
                break
                
        return recommendations
    except Exception as e:
        print(f"Error in personalized recommendation: {e}")
        return get_trending()

# --- 5. ROUTES ---
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

@app.route('/recommend/personalized', methods=['POST'])
def get_personalized():
    data = request.get_json()
    if not data or 'user_id' not in data:
        return jsonify({"error": "Missing user_id"}), 400
        
    user_id = data.get('user_id')
    result = recommend_for_user(user_id)
    
    return jsonify({
        "user_id": user_id,
        "recommendations": result
    })

@app.route('/trending', methods=['GET'])
def get_trending_route():
    result = get_trending()
    return jsonify({"recommendations": result})

# --- 6. RUN APP ---
if __name__ == '__main__':
    # Make sure your database and pkl file are ready before running
    if movies is not None:
        app.run(port=5000, debug=True)
    else:
        print("Failed to start server: Database connection error.")