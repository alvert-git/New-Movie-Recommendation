# 🎬 Movie Recommendation System

A premium, full-stack movie platform powered by a hybrid AI recommendation engine, real-time sentiment analysis, and a conversational AI chatbot. This project delivers personalized user experiences, a robust administrative suite, and a scalable architecture.

---

## 🌟 Key Features

- **Hybrid Recommendation Engine**: Delivers suggestions based on movie content similarity and individual user behavior.
- **Real-time Model Rebuild**: Admins can update the movie catalog, and the engine automatically recalculates similarity scores via a Flask API.
- **AI Sentiment Analysis**: Sophisticated review processing that classifies user feedback as Positive or Negative.
- **Conversational Chatbot**: An integrated Rasa-powered chatbot to assist users with movie queries.
- **Interactive Dashboard**: Full-featured admin panel with earnings analytics, user management, and catalog control.
- **Secure Transactions**: Seamless payment integration with eSewa and Khalti for movie rentals and purchases.
- **Personalized Feed**: A dynamic "Recommended for You" section that evolves as users interact with the platform.

---

## 🚀 Technologies Used

### Frontend
- **React.js & Vite**: For a blazingly fast and reactive user interface.
- **Tailwind CSS**: Modern utility-first CSS framework for premium styling.
- **Redux Toolkit**: Centralized state management for cart, auth, and UI states.
- **Lucide Icons**: Crisp, scalable iconography.

### Backend
- **Node.js & Express.js**: High-performance server-side environment.
- **MySQL**: Relational database for structured data management.
- **JWT & Bcrypt**: Robust authentication and industry-standard password hashing.
- **Passport.js**: Integrated Google OAuth 2.0 social login.

### Machine Learning (AI)
- **Python & Flask**: Backend for serving high-performance ML models.
- **Scikit-Learn**: Powering Vectorization, Cosine Similarity, and Sentiment classification.
- **Pandas & NumPy**: Efficient data processing and matrix manipulation.
- **NLTK**: Advanced text normalization and stop-word filtering.

### Chatbot
- **Rasa Open Source**: For NLP-driven conversational AI.
- **Python Actions SDK**: For custom logic and external API integrations within the chatbot.

---

## 🤖 Algorithms & Implementation Steps

### 1. Content-Based Recommendation (Similarity Matrix)
The engine calculates the "mathematical distance" between movies based on their metadata (tags).

**Implementation Steps:**
1.  **Data Extraction**: Fetches `movie_id`, `title`, and `tags` strings from the database.
2.  **Text Vectorization**: Uses `CountVectorizer` to convert text tags into numerical vectors, creating a high-dimensional feature space.
3.  **Cosine Similarity**: Measures the cosine of the angle between vectors. A smaller angle (value closer to 1) indicates higher similarity.
4.  **Indexing**: Generates a square similarity matrix where each cell $(i, j)$ represents the similarity between Movie $i$ and Movie $j$.
5.  **Retrieval**: When a movie is selected, the system finds its index and returns the top 5 indices with the highest similarity scores.

### 2. Hybrid Personalized Recommendation
Goes beyond static similarity by learning from user interactions (Views, Watchlists, and Purchases).

**Implementation Steps:**
1.  **Interaction Fetching**: Retrieves a user's interaction history from the `user_interactions` table.
2.  **Weighted Scoring**: Assigns weights to interaction types: **Purchase (5)**, **Watchlist (4)**, and **View (1)**.
3.  **Cumulative Scoring**:
    - For every movie in the database, a "Personal Interest Score" is calculated by summing its similarity to all movies the user interacted with, multiplied by the interaction weight.
4.  **Filtering**: Automatically excludes movies the user has already purchased or added to their watchlist.
5.  **Ranking**: Sorts movies by the calculated score and serves the top 5 unique recommendations.

### 3. Review Sentiment Analysis
Automatically classifies user reviews to provide quick sentiment feedback to admins and users.

**Implementation Steps:**
1.  **Cleaning**: The incoming review is converted to lowercase and common "stopwords" (the, is, at) are removed using NLTK.
2.  **TF-IDF Transformation**: The cleaned text is converted into a numerical format using a pre-trained `TfidfVectorizer`.
3.  **Classification**: The vector is fed into a trained classifier (Linear SVM/Logistic Regression) which outputs a prediction label.
4.  **Result**: Returns `Positive` (1) or `Negative` (0) back to the frontend for display and storage.

---

## 📂 Project Structure

```text
├── Backend/          # Node.js Express server
│   ├── config/       # DB and Passport configurations
│   ├── controllers/  # Business logic for auth, movies, and orders
│   ├── routes/       # API endpoint definitions
│   └── uploads/      # Locally stored movie assets
├── Frontend/         # React.js application
│   ├── src/
│   │   ├── components/ # Reusable UI pieces
│   │   ├── pages/      # View components (Admin, Home, Details)
│   │   └── store/      # Redux state management
├── New_Modal/        # Python Flask AI Server
│   ├── app.py        # Main API & Recommendation logic
│   ├── similarity.pkl# Pre-computed similarity matrix
│   └── scaler.pkl    # TF-IDF vocabulary for sentiment
├── Chatbot/          # Rasa Conversational AI
│   ├── actions/      # Custom action scripts
│   ├── data/         # NLU and Stories training data
│   └── domain.yml    # Bot world definition
└── Data/             # Initial datasets and SQL dumps
```

---

## 🛠️ How to Run the Project

### 1. Database Setup
1.  Initialize **MySQL** on your local machine.
2.  Create a database named `movie_recommend`.
3.  Import the SQL dump from `Data/movie_recommend.sql` (or check `Backend/config/`).

### 2. Python AI Server
```bash
cd New_Modal
pip install -r requirements.txt # flask pandas scikit-learn nltk mysql-connector-python
python app.py
```

### 3. Backend (Node.js)
```bash
cd Backend
npm install
# Configure .env with DB_HOST, DB_USER, DB_NAME, JWT_SECRET, VITE_BACKEND_URL
npm start
```

### 4. Frontend (React)
```bash
cd Frontend
npm install
npm run dev
```

### 5. Chatbot (Rasa)
```bash
cd Chatbot
rasa train          # To train the model
rasa run --enable-api --cors "*" 
rasa run actions -p 5055 
```

---

## 📝 License & Contact
Developed as part of the **BCA 6th Semester Project**.  
For inquiries, please refer to the project documentation within the repository.
