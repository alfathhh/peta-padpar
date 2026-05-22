import requests

def test_post_api_auth_login_with_valid_credentials():
    base_url = "http://localhost:3000"
    endpoint = "/api/auth/login"
    url = base_url + endpoint
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "username": "admin",
        "password": "admin123"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        json_response = response.json()
        assert isinstance(json_response, dict), "Response is not a JSON object"
        assert "token" in json_response, "JWT token not found in response"
        token = json_response.get("token")
        assert isinstance(token, str) and len(token) > 0, "JWT token is empty or invalid"
    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_post_api_auth_login_with_valid_credentials()