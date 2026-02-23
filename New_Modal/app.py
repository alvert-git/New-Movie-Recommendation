from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app)

# --- LOAD ONCE (Outside the route) ---
print("🚀 AI Server starting... loading models...")
movies = pd.read_csv('movies_to_db.csv')
similarity = pickle.load(open('similarity.pkl', 'rb'))
print("✅ AI Models ready!")

@app.route('/recommend', methods=['GET'])
def recommend():
    title = request.args.get('title')
    if not title:
        return jsonify({"error": "No title provided"}), 400

    try:
        # Find index
        idx = movies[movies['title'].str.lower() == title.lower()].index[0]
        
        # Calculate similarity
        distances = similarity[idx]
        movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]
        
        # Get IDs
        recommended_ids = [int(movies.iloc[i[0]].movie_id) for i in movie_list]
        
        print(f"✅ Recommended for {title}: {recommended_ids}")
        return jsonify(recommended_ids)

    except IndexError:
        print(f"⚠️ Movie '{title}' not found in CSV")
        return jsonify({"error": "Movie not found"}), 404
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)