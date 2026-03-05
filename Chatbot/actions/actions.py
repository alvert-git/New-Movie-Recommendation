from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import mysql.connector
from mysql.connector import Error

class ActionMovieSearch(Action):
    def name(self) -> Text:
        return "action_movie_search"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        genre = tracker.get_slot("genre")
        actor = tracker.get_slot("actor")
        director = tracker.get_slot("director")
        year = tracker.get_slot("year")

        # Base Query logic
        params = []
        intent_name = tracker.latest_message['intent'].get('name')

        if intent_name == 'recommend_high_budget':
            query = "SELECT movie_id, title, release_date, poster_url FROM movies ORDER BY budget DESC LIMIT 5"
        elif intent_name == 'recommend_latest':
            query = "SELECT movie_id, title, release_date, poster_url FROM movies ORDER BY release_date DESC LIMIT 5"
        elif intent_name == 'recommend_short_runtime':
            query = "SELECT movie_id, title, release_date, poster_url FROM movies WHERE runtime < 100 AND runtime > 0 ORDER BY RAND() LIMIT 5"
        elif intent_name == 'recommend_by_year' and year:
            query = "SELECT movie_id, title, release_date, poster_url FROM movies WHERE release_date LIKE %s ORDER BY RAND() LIMIT 5"
            params.append(f"{year}%")
        elif not genre and not actor and not director and not year:
            # Check if user actually asked for a person but NLU failed to find the name
            if intent_name == 'search_by_person':
                dispatcher.utter_message(text="I recognized you're looking for someone, but I don't have that person in my credits. Who else do you like?")
                return []
            
            # Otherwise, proceed with random
            query = "SELECT movie_id, title, release_date, poster_url FROM movies ORDER BY RAND() LIMIT 5"
        else:
            query = "SELECT movie_id, title, release_date, poster_url FROM movies WHERE 1=1"
            if genre:
                query += " AND genres LIKE %s"
                params.append(f"%{genre}%")
            if actor:
                query += " AND cast LIKE %s"
                params.append(f"%{actor}%")
            if director:
                query += " AND crew LIKE %s"
                params.append(f"%{director}%")
            query += " ORDER BY release_date DESC LIMIT 5"

        try:
            connection = mysql.connector.connect(
                host="localhost",
                user="root",
                password="",
                database="movie_recommend",
                auth_plugin='mysql_native_password'
            )

            if connection.is_connected():
                cursor = connection.cursor(dictionary=True)
                cursor.execute(query, tuple(params))
                results = cursor.fetchall()

                if not results:
                    dispatcher.utter_message(text="I couldn't find any movies matching that request.")
                else:
                    movies_data = []
                    for movie in results:
                        movies_data.append({
                            "movie_id": movie["movie_id"],
                            "title": movie["title"],
                            "release_date": str(movie["release_date"]) if movie["release_date"] else "N/A",
                            "poster_url": f"http://localhost:9000{movie['poster_url']}" if movie['poster_url'] else None
                        })
                    
                    dispatcher.utter_message(
                        text="🎬 I found these for you:",
                        custom={"movies": movies_data}
                    )

        except Error as e:
            print(f"DB Error: {e}")
            dispatcher.utter_message(text="I'm having trouble accessing my movie database.")
        finally:
            if 'connection' in locals() and connection.is_connected():
                cursor.close()
                connection.close()
        
        # Reset slots so the next search starts fresh
        return [
            SlotSet("genre", None), 
            SlotSet("actor", None), 
            SlotSet("director", None),
            SlotSet("year", None)
        ]