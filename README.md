# 🎬 Movie Recommendation System

A full-stack, AI-powered movie recommendation platform that suggests movies based on content similarity. The project features a robust admin dashboard, secure authentication, and a dynamic recommendation engine built with Python and React.

---

## 🚀 Technologies Used

### Frontend
- **React.js & Vite**: Modern UI development with fast build times.
- **Tailwind CSS**: For sleek, responsive styling.
- **Lucide & React Icons**: Premium iconography.
- **Axios**: For seamless API communication.
- **React Router Dom**: Client-side routing.

### Backend
- **Node.js & Express.js**: Scalable server-side logic.
- **MySQL**: Relational database for storing user data, movies, and reviews.
- **JWT (JSON Web Token)**: Secure user authentication.
- **Bcrypt**: Advanced password hashing.
- **Multer**: Handling image and asset uploads.
- **Passport.js**: Social authentication (Google OAuth).

### Machine Learning (AI)
- **Python**: Core language for the recommendation engine.
- **Flask**: Micro-framework for serving the ML models as an API.
- **Sentiment Analysis**: An additional AI layer that analyzes user reviews to determine if they are positive, negative, or neutral.
- **Pandas & NumPy**: Data manipulation and processing.
- **Scikit-learn**: For vectorization and similarity calculations.
- **NLTK**: Natural Language Toolkit for text normalization (Stemming).

---

## 🤖 Algorithms & Techniques

### 1. Movie Recommendation System
The recommendation engine uses **Content-Based Filtering** to suggest movies similar to the one a user is currently viewing.

**How the Model is Created:**
1.  **Data Acquisition**: Merging movie metadata (TMDB 5000 dataset) and credits.
2.  **Feature Selection**: Extracting key features like `overview`, `genres`, `keywords`, `cast` (Top 3 actors), and `crew` (Director).
3.  **Preprocessing**:
    *   **Data Cleaning**: Removing spaces from names (e.g., "Johnny Depp" -> "JohnnyDepp") to create unique tags.
4.  **Text Normalization**:
    *   **Stemming**: Using the `PorterStemmer` from the NLTK library to convert words to their root form.
5.  **Vectorization**:
    *   **Bag of Words**: Converting the tags into numerical vectors using `CountVectorizer`.
6.  **Similarity Metric**:
    *   **Cosine Similarity**: Calculating the distance between vectors.

### 2. Sentiment Analysis (Reviews)
When a user submits a review, the text is sent to the Flask AI server. It predicts whether the review is **Positive**, **Negative**, or **Neutral**, allowing the system to gauge user sentiment automatically.

---

## 🗄️ Database Models (MySQL)

1.  **Users**: Stores secure credentials (Bcrypt), profile pictures, and Google OAuth IDs.
2.  **Movies**: Contains processed movie metadata, local storage paths for posters/backdrops, and the generated ML tags.
3.  **Reviews**: Links users to movies with ratings and AI-generated sentiment scores.
4.  **Watchlist**: A personalized collection of movies users want to save for later.
5.  **Purchases**: Tracks movie rentals/buys with payment gateway integration (eSewa/Khalti).


### Dynamic Model Rebuilding:
Unlike static models, this project includes an **Admin Dashboard** where adding, updating, or deleting a movie automatically triggers a model rebuild on the Flask server, ensuring recommendations are always up-to-date with the database.

---

## 🛠️ How to Run the Project

### Prerequisites
- Node.js (v16+)
- Python 3.9+
- MySQL Server

### 1. Database Setup
- Create a MySQL database named `movie_recommend`.
- Import the provided `.sql` dump file found in `Backend/config/`.

### 2. Backend Setup
```bash
cd Backend
npm install
# Create a .env file based on .env_example
npm start  # or nodemon index.js
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### 4. ML Modal (Flask API) Setup
```bash
cd Modal
pip install flask pandas scikit-learn nltk sqlalchemy mysql-connector-python
python api/index.py
```

---

## 📂 Project Structure Details

### Models Created
- **Recommendation Model**: A serialized `similarity.pkl` file containing the pre-computed similarity matrix for all movies in the database.
- **Data Models**: Structured MySQL tables for `Users`, `Movies`, `Reviews`, `Watchlist`, and `Payments`.

### Key Features
- **Smart Recommendations**: Instant movie suggestions based on tags.
- **Admin Dashboard**: Real-time management of movie catalogs and earnings tracking.
- **Secure Payments**: Integration for purchasing or renting movies.
- **Social Features**: User reviews, ratings, and personalized watchlists.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.

---


rasa run --enable-api --cors "*" 
rasa run actions -p 5055 
## 📝 License
This project was developed as part of the BCA 6th Semester Project.
