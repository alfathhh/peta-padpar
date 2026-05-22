import requests

BASE_URL = "http://localhost:5173"
AUTH_CREDENTIALS = ("admin", "admin123")
TIMEOUT = 30

def test_put_api_infrastruktur_update_infrastructure_with_valid_and_invalid_data():
    # Step 1: Obtain JWT token by logging in
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "username": AUTH_CREDENTIALS[0],
        "password": AUTH_CREDENTIALS[1]
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token, "JWT token not received on login"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 2: Create an infrastructure record to update
    create_url = f"{BASE_URL}/api/infrastruktur"
    # Added missing required fields: kategori, kdkab, kddesa
    infrastructure_payload = {
        "nama": "Test Infrastruktur",
        "alamat": "Jl. Testing No.1",
        "kategori": "restoran",
        "kdkategori": "restoran",  # assuming category code valid
        "kdkab": "1305",          # added required kabupaten code
        "kdkec": "130501",        # valid kecamatan code
        "kddesa": "1305010001",  # added required desa code
        "lat": -0.951,             # valid latitude
        "lng": 100.351,            # valid longitude
        "deskripsi": "Deskripsi testing",
        "telepon": "08123456789",
        "website": "https://example.com"
    }
    create_resp = requests.post(create_url, json=infrastructure_payload, headers=headers, timeout=TIMEOUT)
    assert create_resp.status_code in (200,201), f"Create infrastructure failed: {create_resp.text}"
    infrastructure = create_resp.json() if create_resp.headers.get("Content-Type","").startswith("application/json") else {}
    infrastructure_id = infrastructure.get("id") or infrastructure.get("_id") or infrastructure.get("data", {}).get("id")
    assert infrastructure_id, "Created infrastructure ID not found"

    try:
        # Step 3: Update the infrastructure with valid updated data (valid coordinates and fields)
        update_url = f"{BASE_URL}/api/infrastruktur/{infrastructure_id}"
        # Added missing required fields for update
        valid_update_payload = {
            "nama": "Test Infrastruktur Updated",
            "alamat": "Jl. Testing No. 2",
            "kategori": "restoran",
            "kdkategori": "restoran",
            "kdkab": "1305",
            "kdkec": "130501",
            "kddesa": "1305010001",
            "lat": -0.952,
            "lng": 100.352,
            "deskripsi": "Deskripsi updated",
            "telepon": "08987654321",
            "website": "https://updated-example.com"
        }
        update_resp = requests.put(update_url, json=valid_update_payload, headers=headers, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Update with valid data failed: {update_resp.text}"
        upd_data = update_resp.json()
        # Validate the returned data matches update (some fields might be returned)
        assert upd_data.get("nama") == valid_update_payload["nama"]
        assert upd_data.get("alamat") == valid_update_payload["alamat"]

        # Step 4: Attempt update with invalid coordinates (e.g. latitude beyond valid range)
        invalid_coord_payload = valid_update_payload.copy()
        invalid_coord_payload["lat"] = 1000  # invalid latitude
        invalid_update_resp = requests.put(update_url, json=invalid_coord_payload, headers=headers, timeout=TIMEOUT)
        assert invalid_update_resp.status_code == 400, f"Expected 400 for invalid coordinates, got {invalid_update_resp.status_code}"

        # Step 5: Attempt update with missing required fields (remove 'nama')
        missing_field_payload = valid_update_payload.copy()
        missing_field_payload.pop("nama")
        missing_field_resp = requests.put(update_url, json=missing_field_payload, headers=headers, timeout=TIMEOUT)
        assert missing_field_resp.status_code == 400, f"Expected 400 for missing required fields, got {missing_field_resp.status_code}"

    finally:
        # Cleanup: delete the created infrastructure
        delete_url = f"{BASE_URL}/api/infrastruktur/{infrastructure_id}"
        delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code in (200, 204), f"Delete infrastructure failed: {delete_resp.text}"


test_put_api_infrastruktur_update_infrastructure_with_valid_and_invalid_data()
