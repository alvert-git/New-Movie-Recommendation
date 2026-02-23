import pandas as pd
import requests
import os
from concurrent.futures import ThreadPoolExecutor
import time

# --- CONFIGURATION ---
API_KEY = "fedd06cc3fdd206babd6a5960600cea5"  # <--- PASTE YOUR KEY HERE
CSV_PATH = 'movies_to_db.csv'
BASE_DIR = os.getcwd()
POSTER_DIR = os.path.join(BASE_DIR, 'public', 'uploads', 'posters')
BACKDROP_DIR = os.path.join(BASE_DIR, 'public', 'uploads', 'backdrops')

# Create folders
os.makedirs(POSTER_DIR, exist_ok=True)
os.makedirs(BACKDROP_DIR, exist_ok=True)

df = pd.read_csv(CSV_PATH)

def fetch_and_download(movie_id, title):
    try:
        # 1. Ask TMDB for the file paths
        api_url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}"
        response = requests.get(api_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            poster_path = data.get('poster_path')
            backdrop_path = data.get('backdrop_path')

            # 2. Download Poster
            if poster_path:
                p_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
                p_res = requests.get(p_url)
                with open(os.path.join(POSTER_DIR, f"{movie_id}.jpg"), 'wb') as f:
                    f.write(p_res.content)
            
            # 3. Download Backdrop
            if backdrop_path:
                b_url = f"https://image.tmdb.org/t/p/original{backdrop_path}"
                b_res = requests.get(b_url)
                with open(os.path.join(BACKDROP_DIR, f"{movie_id}.jpg"), 'wb') as f:
                    f.write(b_res.content)
                    
            print(f"✅ Downloaded assets for: {title}")
        else:
            print(f"❌ Failed to find {title} (ID: {movie_id}) on TMDB")

    except Exception as e:
        print(f"⚠️ Error processing {title}: {e}")

def start_sync():
    print(f"🚀 Starting download for {len(df)} movies...")
    # Using 5 workers to be safe with API rate limits
    with ThreadPoolExecutor(max_workers=5) as executor:
        for index, row in df.iterrows():
            executor.submit(fetch_and_download, row['movie_id'], row['title'])
            # Small sleep to prevent hitting rate limits too hard
            if index % 10 == 0:
                time.sleep(0.5)

if __name__ == "__main__":
    if API_KEY == "YOUR_TMDB_API_KEY_HERE":
        print("❌ Please paste your API Key into the script first!")
    else:
        start_sync()
        print("\n✨ Sync Complete! Check your public/uploads/ folder.")