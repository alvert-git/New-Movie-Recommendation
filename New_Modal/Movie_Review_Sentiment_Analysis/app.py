import pandas as pd 
import pickle as pk
import re
import streamlit as st

# Load the improved model and vectorizer
model = pk.load(open('model_v2.pkl','rb'))
vectorizer = pk.load(open('vectorizer_v2.pkl','rb'))

def clean_text(text):
    """Matches the cleaning logic used during model training."""
    text = re.sub(r"<.*?>", "", text)   # remove HTML tags
    text = re.sub(r"[^a-zA-Z]", " ", text)  # keep only letters
    text = text.lower()
    return text

st.title("🎬 Movie Review Sentiment Analysis")
review = st.text_area('Enter Movie Review', height=150)

if st.button('Predict Sentiment'):
    if review.strip():
        # 1. Clean and Transform
        cleaned_review = clean_text(review)
        review_vector = vectorizer.transform([cleaned_review]).toarray()
        
        # 2. Get Probabilities for "Neutral" detection
        # [[prob_neg, prob_pos]]
        proba = model.predict_proba(review_vector)[0]
        pos_proba = proba[1]
        
        # 3. Determine Sentiment with Neutral Threshold
        if 0.35 <= pos_proba <= 0.65:
            st.info(f'Neutral Review 😐 (Confidence: {pos_proba:.2%})')
        elif pos_proba > 0.65:
            st.success(f'Positive Review 😊 (Confidence: {pos_proba:.2%})')
        else:
            st.error(f'Negative Review 😡 (Confidence: {1-pos_proba:.2%})')
    else:
        st.warning("Please enter a review to analyze.")