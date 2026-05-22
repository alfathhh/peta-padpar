import requests

BASE_URL = "http://localhost:5173"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
INFRASTRUCTURE_URL = f"{BASE_URL}/api/infrastruktur"
AUTH_CREDENTIALS = {"username": "admin", "password": "admin123"}
TIMEOUT = 30


def test_post_api_infrastruktur_create_with_and_without_jwt():
    token = None
    created_infrastruktur_id = None

    # Step 1: Login to get JWT token
    try:
        login_resp = requests.post(
            LOGIN_URL,
            json=AUTH_CREDENTIALS,
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "token" in login_data and isinstance(login_data["token"], str) and login_data["token"], "JWT token missing in login response"
        token = login_data["token"]
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    # Payload for creating infrastructure, adjusted kategori as category ID
    payload = {
        "nama": "Test Infrastruktur TC007",
        "kategori": "1",
        "alamat": "Jl. Test No. 1",
        "kdkec": "130501",
        "kddesa": "1305010001",
        "latitude": -0.123456,
        "longitude": 100.123456,
        "keterangan": "Infrastructure created for testing TC007"
    }

    headers_auth = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    headers_no_auth = {
        "Content-Type": "application/json"
    }

    # Step 2: POST /api/infrastruktur with valid JWT
    try:
        post_resp = requests.post(
            INFRASTRUCTURE_URL,
            json=payload,
            headers=headers_auth,
            timeout=TIMEOUT,
        )
        assert post_resp.status_code in (200, 201), f"Create infrastructure with JWT failed: {post_resp.status_code}"
        post_data = post_resp.json()
        # Expecting created resource data including at least an ID
        assert isinstance(post_data, dict), "Response data is not a dict"
        assert "id" in post_data, "Response missing infrastructure id field"
        created_infrastruktur_id = post_data.get("id")
    except requests.RequestException as e:
        assert False, f"Create infrastructure request with JWT failed: {e}"

    # Step 3: POST /api/infrastruktur without JWT should return 401 unauthorized
    try:
        post_no_auth_resp = requests.post(
            INFRASTRUCTURE_URL,
            json=payload,
            headers=headers_no_auth,
            timeout=TIMEOUT,
        )
        assert post_no_auth_resp.status_code == 401, f"Create infrastructure without JWT did not return 401, got {post_no_auth_resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Create infrastructure request without JWT failed: {e}"

    # Cleanup: Delete created infrastructure if created
    if created_infrastruktur_id:
        delete_url = f"{INFRASTRUCTURE_URL}/{created_infrastruktur_id}"
        try:
            delete_resp = requests.delete(
                delete_url,
                headers=headers_auth,
                timeout=TIMEOUT,
            )
            # Accept 200 or 204 as successful deletion
            assert delete_resp.status_code in (200, 204), f"Failed to delete infrastructure, status {delete_resp.status_code}"
        except requests.RequestException as e:
            assert False, f"Delete infrastructure request failed: {e}"


test_post_api_infrastruktur_create_with_and_without_jwt()
