import requests

BASE_URL = "http://localhost:5173"
USERNAME = "admin"
PASSWORD = "admin123"
TIMEOUT = 30


def test_delete_api_kategori_with_and_without_dependencies():
    # Authenticate to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {"username": USERNAME, "password": PASSWORD}
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, "Login failed"
    token = login_resp.json().get("token")
    assert token, "JWT token is missing in login response"
    headers = {"Authorization": f"Bearer {token}"}

    # Helper to create category
    def create_category(name):
        payload = {"nama": name}
        resp = requests.post(f"{BASE_URL}/api/kategori", json=payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code in (200, 201), f"Failed to create category {name}"
        return resp.json().get("id")

    # Helper to create infrastructure linked to a category
    def create_infrastruktur(name, category_id):
        payload = {
            "nama": name,
            "kategori": category_id,
            "alamat": "Test address",
            "kdkec": "130501",
            "lat": -0.001,
            "lng": 0.001,
        }
        resp = requests.post(f"{BASE_URL}/api/infrastruktur", json=payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code in (200, 201), "Failed to create infrastructure"
        return resp.json().get("id")

    # Helper to delete category by id
    def delete_category(category_id):
        return requests.delete(f"{BASE_URL}/api/kategori/{category_id}", headers=headers, timeout=TIMEOUT)

    # Helper to delete infrastructure by id
    def delete_infrastruktur(infrastruktur_id):
        return requests.delete(f"{BASE_URL}/api/infrastruktur/{infrastruktur_id}", headers=headers, timeout=TIMEOUT)

    # Step 1: Create a category not used by any infrastructure
    category_to_delete_id = None
    try:
        category_to_delete_id = create_category("CategoryToDelete_NotUsed")

        # Attempt to delete this category - should succeed with 200 or 204
        del_resp = delete_category(category_to_delete_id)
        assert del_resp.status_code in (200, 204), f"Failed to delete unused category, status: {del_resp.status_code}"

        # Verify category is deleted by getting list and confirming absence
        get_resp = requests.get(f"{BASE_URL}/api/kategori", timeout=TIMEOUT)
        assert get_resp.status_code == 200, "Failed to get categories after deletion"
        categories = get_resp.json()
        assert all(
            (c.get("id") != category_to_delete_id and c.get("kategori_id") != category_to_delete_id) for c in categories if isinstance(categories, list)
        ), "Deleted category still present in list"

    finally:
        # Cleanup if not deleted
        if category_to_delete_id:
            # Attempt delete silently in case test failed before deletion
            delete_category(category_to_delete_id)

    # Step 2: Create a category used by infrastructure
    used_category_id = None
    infrastruktur_id = None
    try:
        used_category_id = create_category("CategoryInUse")
        infrastruktur_id = create_infrastruktur("InfraUsingCategory", used_category_id)

        # Attempt to delete category in use - expect failure with 400 or 409
        del_in_use_resp = delete_category(used_category_id)
        assert del_in_use_resp.status_code in (400, 409), f"Deleting category in use should fail with 400 or 409, got {del_in_use_resp.status_code}"

        # Verify category still present in list after failed delete
        get_resp_after_fail = requests.get(f"{BASE_URL}/api/kategori", timeout=TIMEOUT)
        assert get_resp_after_fail.status_code == 200, "Failed to get categories after failed deletion"
        categories_after_fail = get_resp_after_fail.json()
        assert any((c.get("id") == used_category_id or c.get("kategori_id") == used_category_id) for c in categories_after_fail if isinstance(categories_after_fail, list)), "Category in use missing after failed delete"

    finally:
        # Cleanup infrastructure then category
        if infrastruktur_id:
            delete_infrastruktur(infrastruktur_id)
        if used_category_id:
            delete_category(used_category_id)


test_delete_api_kategori_with_and_without_dependencies()
