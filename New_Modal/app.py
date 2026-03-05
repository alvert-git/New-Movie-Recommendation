from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import nltk
from nltk.corpus import stopwords
import re

# Download stopwords for the cleaning function
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

app = Flask(__name__)
CORS(app)

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

if __name__ == "__main__":
    # Port 5000 is standard for Flask
    app.run(port=5000, debug=True)