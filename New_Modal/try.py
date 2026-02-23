import requests
key = "fedd06cc3fdd206babd6a5960600cea5"
url = f"https://api.themoviedb.org/3/movie/155?api_key={key}" # Testing with The Dark Knight
print(requests.get(url).json())