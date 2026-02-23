import pickle
import pandas as pd
import time

def test_logic():
    print("⏳ Loading data...")
    start_time = time.time()
    
    try:
        movies = pd.read_csv('movies_to_db.csv')
        similarity = pickle.load(open('similarity.pkl', 'rb'))
        load_time = time.time() - start_time
        print(f"✅ Data loaded in {load_time:.2f} seconds")

        # Test with 'Deadpool'
        test_movie = "Deadpool"
        print(f"🔍 Finding recommendations for: {test_movie}")
        
        search_start = time.time()
        # Case insensitive match
        idx = movies[movies['title'].str.lower() == test_movie.lower()].index[0]
        distances = similarity[idx]
        movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]
        
        recs = [movies.iloc[i[0]].title for i in movie_list]
        search_time = time.time() - search_start
        
        print(f"✨ Results: {recs}")
        print(f"⚡ Search completed in {search_time:.4f} seconds")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_logic()