from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
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

        # Base Query logic
        params = []
        if not genre and not actor and not director:
            # Check if user actually asked for a person but NLU failed to find the name
            if tracker.latest_message['intent'].get('name') == 'search_by_person':
                dispatcher.utter_message(text="I recognized you're looking for someone, but I don't have that person in my credits. Who else do you like?")
                return []
            
            # Otherwise, proceed with random
            query = "SELECT title, release_date FROM movies ORDER BY RAND() LIMIT 5"
        else:
            query = "SELECT title, release_date FROM movies WHERE 1=1"
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
                    response = "🎬 I found these for you:\n"
                    for i, movie in enumerate(results, 1):
                        response += f"{i}. {movie['title']} ({movie['release_date']})\n"
                    dispatcher.utter_message(text=response)

        except Error as e:
            print(f"DB Error: {e}")
            dispatcher.utter_message(text="I'm having trouble accessing my movie database.")
        finally:
            if 'connection' in locals() and connection.is_connected():
                cursor.close()
                connection.close()
        return []