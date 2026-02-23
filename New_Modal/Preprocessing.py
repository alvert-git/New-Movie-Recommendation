import pandas as pd
import numpy as np
import ast
import os
import requests
import nltk
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
# 1. Load Data
movies = pd.read_csv('D:\\Coding\\BCA 6th Sem ProjectII\\Content-based\\Data\\tmdb_5000_movies.csv')
credits = pd.read_csv('D:\\Coding\\BCA 6th Sem ProjectII\\Content-based\\Data\\tmdb_5000_credits.csv')

# 2. Merge 
df = movies.merge(credits, on='title')
df = df.sort_values(by='popularity', ascending=False).head(1000).reset_index(drop=True)
df.rename(columns={'id': 'movie_id_ref'}, inplace=True)
# 3. Helper Functions
def convert(obj):
    L = []
    try:
        for i in ast.literal_eval(obj):
            L.append(i['name'])
    except:
        pass
    return L

def convert3(obj):
    L = []
    counter = 0
    try:
        for i in ast.literal_eval(obj):
            if counter != 3:
                L.append(i['name'])
                counter += 1
            else:
                break
    except:
        pass
    return L

def fetch_director(obj):
    try:
        for i in ast.literal_eval(obj):
            if i['job'] == 'Director':
                return [i['name']]
    except:
        pass
    return []

# 4. Processing Metadata
df['genres_list'] = df['genres'].apply(convert)
df['keywords_list'] = df['keywords'].apply(convert)
df['cast_list'] = df['cast'].apply(convert3)
df['crew_list'] = df['crew'].apply(fetch_director)

# 5. Build Local URLs (Using the corrected column name 'movie_id_ref')
df['poster_url'] = df['movie_id_ref'].apply(lambda x: f"/uploads/posters/{x}.jpg")
df['backdrop_url'] = df['movie_id_ref'].apply(lambda x: f"/uploads/backdrops/{x}.jpg")
df['video_url'] = "https://www.youtube.com/watch?v=lCgtmgiII7M" 
df['price'] = 9.99 

# 6. Recommendation Logic (Tags & ML)
def collapse(L):
    return [i.replace(" ", "") for i in L]

df['genres_ml'] = df['genres_list'].apply(collapse)
df['keywords_ml'] = df['keywords_list'].apply(collapse)
df['cast_ml'] = df['cast_list'].apply(collapse)
df['crew_ml'] = df['crew_list'].apply(collapse)
df['overview'] = df['overview'].fillna("")
df['overview_ml'] = df['overview'].apply(lambda x: x.split())

df['tags'] = df['overview_ml'] + df['genres_ml'] + df['keywords_ml'] + df['cast_ml'] + df['crew_ml']
df['tags'] = df['tags'].apply(lambda x: " ".join(x).lower())

ps = PorterStemmer()
def stem(text):
    return " ".join([ps.stem(word) for word in text.split()])
df['tags'] = df['tags'].apply(stem)

# 7. Vectorization
cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(df['tags']).toarray()
similarity = cosine_similarity(vectors)

# 8. SAVE ML FILES
pickle.dump(similarity, open('similarity.pkl', 'wb'))

final_db_export = df[[
    'movie_id_ref', 'title', 'tagline', 'overview', 'runtime', 
    'release_date', 'budget', 'price', 'poster_url', 
    'backdrop_url', 'video_url', 'tags'
]].copy()

final_db_export.rename(columns={'movie_id_ref': 'movie_id'}, inplace=True)

final_db_export['genres'] = df['genres_list'].apply(lambda x: ", ".join(x))
final_db_export['cast'] = df['cast_list'].apply(lambda x: ", ".join(x))
final_db_export['crew'] = df['crew_list'].apply(lambda x: ", ".join(x))

final_db_export.to_csv('movies_to_db.csv', index=False)
print("Success! CSV created without requiring missing path columns.")