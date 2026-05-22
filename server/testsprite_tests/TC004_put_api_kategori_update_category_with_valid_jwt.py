import requests

BASE_URL = "http://localhost:5173"
AUTH_ENDPOINT = f"{BASE_URL}/api/auth/login"
KATEGORI_ENDPOINT = f"{BASE_URL}/api/kategori"
USERNAME = "admin"
PASSWORD = "admin123"
TIMEOUT = 30


def test_put_api_kategori_update_category_with_valid_jwt():
    auth_response = requests.post(
        AUTH_ENDPOINT,
        json={"username": USERNAME, "password": PASSWORD},
        timeout=TIMEOUT
    )
    assert auth_response.status_code == 200, f"Auth failed with status {auth_response.status_code}"
    token = auth_response.json().get("token")
    assert token and isinstance(token, str), "JWT token not received or invalid"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # First create a new category to update
    new_category_payload = {
        "nama": "TestCategory_TC004",
        "keterangan": "Category created for TC004 update test"
    }

    create_response = requests.post(KATEGORI_ENDPOINT, json=new_category_payload, headers=headers, timeout=TIMEOUT)
    assert create_response.status_code in (200, 201), f"Category creation failed with status {create_response.status_code}"
    created_category = create_response.json()
    category_id = created_category.get("id")
    assert category_id is not None, "Created category ID not found"

    updated_category_payload = {
        "nama": "UpdatedCategory_TC004",
        "keterangan": "Updated category description for TC004"
    }

    try:
        # Update the category
        update_response = requests.put(
            f"{KATEGORI_ENDPOINT}/{category_id}",
            json=updated_category_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert update_response.status_code == 200, f"Category update failed with status {update_response.status_code}"
        updated_category = update_response.json()
        assert updated_category.get("nama") == updated_category_payload["nama"], "Category name not updated correctly"
        assert updated_category.get("keterangan") == updated_category_payload["keterangan"], "Category description not updated correctly"

        # Verify the update by fetching the category list and confirming changes
        list_response = requests.get(KATEGORI_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert list_response.status_code == 200, f"Failed to get category list with status {list_response.status_code}"
        categories = list_response.json()
        category = next((c for c in categories if c.get("id") == category_id), None)
        assert category is not None, "Updated category not found in category list"
        assert category.get("nama") == updated_category_payload["nama"], "Category name mismatch in list after update"
        assert category.get("keterangan") == updated_category_payload["keterangan"], "Category description mismatch in list after update"

    finally:
        # Cleanup: delete the created category
        del_response = requests.delete(
            f"{KATEGORI_ENDPOINT}/{category_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert del_response.status_code in (200, 204), f"Failed to delete category in cleanup with status {del_response.status_code}"


test_put_api_kategori_update_category_with_valid_jwt()
