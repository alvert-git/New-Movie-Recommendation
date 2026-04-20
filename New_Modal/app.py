from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import nltk
from nltk.corpus import stopwords
import re
import mysql.connector
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Download stopwords for the cleaning function
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

app = Flask(__name__)
CORS(app)

# --- DATABASE CONFIG ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'movie_recommend'
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

# --- LOAD MODELS & DATA ---
print("🚀 AI Server starting... loading models...")
try:
    # Recommendation Data
    movies = pd.read_csv('movies_to_db.csv')
    similarity = pickle.load(open('similarity.pkl', 'rb'))

    # Sentiment Analysis Models (Based on your training code)
    # Ensure 'model.pkl' and 'scaler.pkl' are in the same folder
    sentiment_model = pickle.load(open('model.pkl', 'rb'))
    tfidf = pickle.load(open('scaler.pkl', 'rb')) 
    
    print("✅ AI Models (Recommendation + Sentiment) ready!")
except Exception as e:
    print(f"❌ Error loading models: {str(e)}")

# --- PREPROCESSING FUNCTION ---
def clean_review(review):
    # Standardize to lowercase and remove stopwords to match training logic
    text = ' '.join(word for word in review.split() if word.lower() not in stop_words)
    return text

# --- HELPER: GET TRENDING ---
def get_trending_ids(limit=5):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT m.movie_id, COALESCE(p.purchase_count, 0) as p_count 
            FROM movies m 
            LEFT JOIN (SELECT movie_id, COUNT(*) as purchase_count FROM purchases WHERE status = 'COMPLETED' GROUP BY movie_id) p 
            ON m.movie_id = p.movie_id 
            ORDER BY p_count DESC, m.id ASC 
            LIMIT %s
        """
        cursor.execute(query, (limit,))
        ids = [row[0] for row in cursor.fetchall()]
        conn.close()
        return ids
    except Exception as e:
        print(f"Error fetching trending: {e}")
        return []

# --- ROUTE: RECOMMENDATION ---
@app.route('/recommend', methods=['GET'])
def recommend():
    title = request.args.get('title')
    if not title:
        return jsonify({"error": "No title provided"}), 400

    try:
        # Find index of the movie
        idx = movies[movies['title'].str.lower() == title.lower()].index[0]
        
        # Calculate similarity
        distances = similarity[idx]
        movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]
        
        # Get IDs
        recommended_ids = [int(movies.iloc[i[0]].movie_id) for i in movie_list]
        
        return jsonify(recommended_ids)

    except IndexError:
        return jsonify({"error": "Movie not found in database"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ROUTE: PERSONALIZED RECOMMENDATION ---
@app.route('/recommend/personalized', methods=['POST'])
def personalized_recommend():
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "No user_id provided"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Fetch user interactions
        cursor.execute("SELECT movie_id, interaction_type FROM user_interactions WHERE user_id = %s", (user_id,))
        interactions = cursor.fetchall()
        
        if not interactions:
            conn.close()
            return jsonify({"recommendations": get_trending_ids()})

        # 2. Define weights
        weights = {'PURCHASE': 5, 'WATCHLIST': 4, 'VIEW': 1}
        
        movie_scores = {} # index -> cumulative score
        interacted_movie_ids = set([int(i['movie_id']) for i in interactions])
        
        # 3. Calculate scores based on content similarity
        # Iterate over each interaction to find similar movies
        for interact in interactions:
            m_id = int(interact['movie_id'])
            m_type = interact['interaction_type']
            weight = weights.get(m_type, 1)
            
            # Find index of this movie in the 'movies' DataFrame
            match = movies[movies['movie_id'] == m_id]
            if match.empty:
                continue
            idx = match.index[0]
            
            # Get similarity scores for this index
            sim_scores = similarity[idx]
            
            # Apply weights to similarity scores
            for i, score in enumerate(sim_scores):
                if i not in movie_scores:
                    movie_scores[i] = 0
                movie_scores[i] += score * weight
        
        conn.close()
        
        # 4. Sort by score
        sorted_indices = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)
        
        # 5. Filter out already interacted movies and limit results
        recommended_ids = []
        for i, score in sorted_indices:
            movie_id = int(movies.iloc[i].movie_id)
            if movie_id not in interacted_movie_ids:
                recommended_ids.append(movie_id)
            if len(recommended_ids) >= 5:
                break
                
        return jsonify({"recommendations": recommended_ids})

    except Exception as e:
        print(f"❌ Personalized Rec Error: {str(e)}")
        return jsonify({"recommendations": get_trending_ids()})

@app.route('/trending', methods=['GET'])
def trending_route():
    return jsonify({"recommendations": get_trending_ids()})

# --- ROUTE: SENTIMENT ANALYSIS ---
@app.route('/predict-sentiment', methods=['POST'])
def predict_sentiment():
    data = request.json
    review_text = data.get('review')

    if not review_text:
        return jsonify({"error": "No review text provided"}), 400

    try:
        # 1. Clean the incoming text (Crucial for accuracy)
        cleaned_text = clean_review(review_text)
        
        # 2. Transform using the LOADED TfidfVectorizer
        # We use .transform(), NOT .fit_transform()
        vectorized_text = tfidf.transform([cleaned_text]).toarray()
        
        # 3. Predict (1 for Pos, 0 for Neg)
        prediction = sentiment_model.predict(vectorized_text)[0]
        
        # Convert 1/0 back to text label if you prefer
        result = "pos" if prediction == 1 else "neg"

        return jsonify({
            "sentiment": result,
            "label": int(prediction)
        })

    except Exception as e:
        print(f"❌ Sentiment Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/rebuild-recommendations', methods=['POST'])
def rebuild_recommendations():
    global movies, similarity
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='movie_recommend'
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT movie_id, title, tags FROM movies")
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return jsonify({"message": "No movies found to build recommendations"}), 200

        df = pd.DataFrame(rows)
        df['tags'] = df['tags'].fillna('')

        cv = CountVectorizer(max_features=5000, stop_words='english')
        vectors = cv.fit_transform(df['tags']).toarray()
        
        new_similarity = cosine_similarity(vectors)

        movies = df
        similarity = new_similarity

        pickle.dump(similarity, open('similarity.pkl', 'wb'))
        df.to_csv('movies_to_db.csv', index=False)

        print("✅ Successfully rebuilt recommendation matrices from database!")
        return jsonify({"message": "Rebuild successful", "movies_count": len(df)}), 200

    except Exception as e:
        print(f"❌ Rebuild Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Port 5000 is standard for Flask
    app.run(port=5000, debug=True)