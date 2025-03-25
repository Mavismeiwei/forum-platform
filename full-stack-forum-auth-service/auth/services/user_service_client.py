# auth/services/user_service_client.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

USER_SERVICE_URL = os.getenv('USER_SERVICE_URL', 'http://localhost:5001')

def get_user_by_email(email):
    """
    Sends a GET request to the User Service's search endpoint to fetch user data by email.
    """
    try:
        url = f"{USER_SERVICE_URL}/users/search"
        print(f"🚀 [Auth] Sending request to User Service: {url} with email: {email}")

        # Add timeout to detect if the request is hanging
        response = requests.get(url, params={"email": email}, timeout=5)

        print(f"🔄 [Auth] User Service Response - Status: {response.status_code}")
        print(f"🔄 [Auth] User Service Response - Body: {response.text}")

        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ [Auth] User Service returned error code {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ [Auth] Error fetching user data from User Service: {e}")
        return None
