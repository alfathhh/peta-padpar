import requests
import json

BASE_URL = "http://localhost:5173"
AUTH_CREDENTIALS = {"username": "admin", "password": "admin123"}
TIMEOUT = 30

def test_delete_infrastruktur_with_valid_jwt():
    # Step 1: Authenticate to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    try:
        login_resp = requests.post(
            login_url,
            json=AUTH_CREDENTIALS,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}: {login_resp.text}"
        token = login_resp.json().get("token")
        assert token is not None and token != "", "JWT token not found in login response"
    except Exception as e:
        assert False, f"Exception during login: {str(e)}"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 2: Create a new infrastructure to get a valid ID for deletion
    create_url = f"{BASE_URL}/api/infrastruktur"
    payload = {
        "nama": "Test Infrastruktur Delete",
        "kategori": "test-category",
        "alamat": "Jl. Test Delete No. 1",
        "kota": "Padang Pariaman",
        "kdkab": "1305",
        "kdkec": "130501",
        "kddesa": "1305010001",
        "lat": -0.100000,
        "lng": 100.000000,
        "telp": "08123456789",
        "email": "testdelete@example.com",
        "website": "http://example.com",
        "keterangan": "Created for delete test case",
        "foto": ""
    }
    infrastruktur_id = None

    try:
        create_resp = requests.post(create_url, headers=headers, json=payload, timeout=TIMEOUT)
        assert create_resp.status_code in (200, 201), f"Create infrastructure failed with status {create_resp.status_code}: {create_resp.text}"
        created_data = create_resp.json()
        # Usually the ID is returned in the response. We must try to find it.
        # Try common keys: id, _id, data.id, etc.
        if isinstance(created_data, dict):
            if "id" in created_data:
                infrastruktur_id = created_data["id"]
            elif "_id" in created_data:
                infrastruktur_id = created_data["_id"]
            elif "data" in created_data and isinstance(created_data["data"], dict) and "id" in created_data["data"]:
                infrastruktur_id = created_data["data"]["id"]
        assert infrastruktur_id is not None, f"Cannot find infrastructure id in creation response: {created_data}"

        # Step 3: Delete the created infrastructure
        delete_url = f"{BASE_URL}/api/infrastruktur/{infrastruktur_id}"
        delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code in (200, 204), f"Delete infrastructure failed with status {delete_resp.status_code}: {delete_resp.text}"

        # Step 4: Verify that the infrastructure is removed by trying to get it (expect 404 or item not found)
        get_url = f"{BASE_URL}/api/infrastruktur/{infrastruktur_id}"
        get_resp = requests.get(get_url, headers=headers, timeout=TIMEOUT)
        # The API might respond 404 or similar if the record is deleted
        assert get_resp.status_code == 404 or (get_resp.status_code == 200 and get_resp.json() == {}), \
            f"Infrastructure still exists after deletion. Status: {get_resp.status_code}, Response: {get_resp.text}"

    finally:
        # Cleanup: If for some reason infrastructure is not deleted by test, delete it here
        if infrastruktur_id is not None:
            cleanup_url = f"{BASE_URL}/api/infrastruktur/{infrastruktur_id}"
            try:
                requests.delete(cleanup_url, headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_delete_infrastruktur_with_valid_jwt()
