import requests
from requests.auth import HTTPBasicAuth

base_url = "http://localhost:3000"

def test_post_api_kategori_create_category_with_valid_jwt():
    auth_url = f"{base_url}/api/auth/login"
    kategori_url = f"{base_url}/api/kategori"

    # Admin credentials for basic token authentication (per instructions)
    username = "admin"
    password = "admin123"

    # Login to get JWT token
    login_payload = {"username": username, "password": password}
    login_resp = requests.post(auth_url, json=login_payload, timeout=30)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token and isinstance(token, str), "Token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Valid category payload with corrected 'value' field
    category_payload = {
        "value": "test_tc_one",
        "label": "Test Category TC One",
        "icon": "📍",
        "color": "#FF5733"
    }

    created_category_id = None
    try:
        # Create a new category
        resp = requests.post(kategori_url, json=category_payload, headers=headers, timeout=30)
        assert resp.status_code in (200, 201), f"Failed to create category: {resp.status_code} {resp.text}"

        resp_json = resp.json()
        # Validate response contains the required fields as per PRD
        for field in ("id", "value", "label", "icon", "color", "urutan"):
            assert field in resp_json, f"Field '{field}' missing in response"

        # Validate values match input
        assert resp_json["value"] == category_payload["value"]
        assert resp_json["label"] == category_payload["label"]
        assert resp_json["icon"] == category_payload["icon"]
        assert resp_json["color"] == category_payload["color"]

        created_category_id = resp_json["id"]

        # Verify the category appears in the list
        list_resp = requests.get(kategori_url, timeout=30)
        assert list_resp.status_code == 200, "Failed to get kategori list"
        categories = list_resp.json()
        assert any(cat.get("id") == created_category_id for cat in categories), "Created category not found in list"

    finally:
        # Cleanup: delete the created category if it exists
        if created_category_id:
            del_resp = requests.delete(f"{kategori_url}/{created_category_id}", headers=headers, timeout=30)
            assert del_resp.status_code in (200, 204), f"Failed to delete category during cleanup: {del_resp.status_code} {del_resp.text}"

test_post_api_kategori_create_category_with_valid_jwt()
