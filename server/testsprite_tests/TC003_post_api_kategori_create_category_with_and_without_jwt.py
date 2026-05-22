import requests
import json

BASE_URL = "http://localhost:5173"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
CREATE_KATEGORI_URL = f"{BASE_URL}/api/kategori"
TIMEOUT = 30

USERNAME = "admin"
PASSWORD = "admin123"

def test_post_api_kategori_create_category_with_and_without_jwt():
    # Step 1: Obtain JWT token with valid credentials
    login_payload = {
        "username": USERNAME,
        "password": PASSWORD
    }
    try:
        login_response = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"
    token = None
    try:
        token = login_response.json().get("token")
    except json.JSONDecodeError:
        assert False, "Login response is not valid JSON"
    assert token, "Token not found in login response"

    headers_auth = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    headers_no_auth = {
        "Content-Type": "application/json"
    }

    # Define category payload
    category_payload = {
        "nama": "TestCategoryTC003"
    }

    # We will create a category with JWT, verify creation, and then cleanup by deleting the created category
    created_category_id = None
    try:
        # Step 2: POST /api/kategori with valid JWT and payload (expect success)
        try:
            create_response = requests.post(CREATE_KATEGORI_URL, headers=headers_auth, json=category_payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Create category request with JWT failed: {e}"

        assert create_response.status_code in (200, 201), f"Category creation failed with status code {create_response.status_code}"
        try:
            create_response_json = create_response.json()
        except json.JSONDecodeError:
            assert False, "Create category response is not valid JSON"
        # The created category should include at least an id field, id key might be named id or _id, assuming id
        created_category_id = create_response_json.get("id") or create_response_json.get("_id")
        assert created_category_id, f"Created category ID not returned in response: {create_response_json}"
        # Additional checks could validate the name matches
        assert create_response_json.get("nama") == category_payload["nama"], "Created category name doesn't match the payload"

        # Step 3: POST /api/kategori without JWT (expect 401 Unauthorized)
        try:
            create_no_auth_response = requests.post(CREATE_KATEGORI_URL, headers=headers_no_auth, json=category_payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Create category request without JWT failed: {e}"

        assert create_no_auth_response.status_code == 401, f"Expected 401 Unauthorized without JWT but got {create_no_auth_response.status_code}"
    finally:
        # Cleanup: delete the created category to avoid pollution (requires valid JWT)
        if created_category_id:
            delete_url = f"{CREATE_KATEGORI_URL}/{created_category_id}"
            try:
                delete_response = requests.delete(delete_url, headers=headers_auth, timeout=TIMEOUT)
                assert delete_response.status_code in (200, 204), f"Failed to delete created category id={created_category_id}, status code {delete_response.status_code}"
            except requests.RequestException:
                pass

test_post_api_kategori_create_category_with_and_without_jwt()
