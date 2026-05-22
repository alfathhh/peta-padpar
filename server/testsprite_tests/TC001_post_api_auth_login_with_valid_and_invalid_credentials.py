import requests

BASE_URL = "http://localhost:5173"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30

def test_post_api_auth_login_with_valid_and_invalid_credentials():
    url = BASE_URL + LOGIN_ENDPOINT
    headers = {"Content-Type": "application/json"}

    # Valid credentials payload
    valid_payload = {
        "username": "admin",
        "password": "admin123"
    }

    # Invalid credentials payload
    invalid_payload = {
        "username": "admin",
        "password": "wrongpassword"
    }

    # Test login with valid credentials
    try:
        valid_response = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Valid credentials request failed with exception: {e}"

    # Assert status code 200
    assert valid_response.status_code == 200, f"Expected 200 for valid login, got {valid_response.status_code}"
    # Assert response contains token
    try:
        valid_json = valid_response.json()
    except ValueError:
        assert False, "Response for valid login is not valid JSON"
    assert "token" in valid_json and isinstance(valid_json["token"], str) and valid_json["token"], "JWT token missing or invalid in valid login response"

    # Test login with invalid credentials
    try:
        invalid_response = requests.post(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Invalid credentials request failed with exception: {e}"

    # Assert status code 401
    assert invalid_response.status_code == 401, f"Expected 401 for invalid login, got {invalid_response.status_code}"
    # Assert response contains error message and no token
    try:
        invalid_json = invalid_response.json()
    except ValueError:
        assert False, "Response for invalid login is not valid JSON"
    assert "error" in invalid_json and isinstance(invalid_json["error"], str) and invalid_json["error"], "Error message missing or invalid in invalid login response"
    assert "token" not in invalid_json, "Token should not be present in invalid login response"

test_post_api_auth_login_with_valid_and_invalid_credentials()