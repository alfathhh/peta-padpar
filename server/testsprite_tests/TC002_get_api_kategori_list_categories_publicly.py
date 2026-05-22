import requests

def test_get_api_kategori_list_categories_publicly():
    base_url = "http://localhost:5173"
    endpoint = "/api/kategori"
    url = base_url + endpoint
    headers = {
        "Accept": "application/json"
    }
    try:
        # Make the GET request without auth (public endpoint)
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    # Validate HTTP status code 200
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    # Validate response is JSON and is a list or dict (list of categories or wrapped)
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    # Validate data structure (expect list or dict containing categories)
    assert isinstance(data, (list, dict)), "Response JSON is not a list or dict as expected"
    # Additional: check if list and items have expected keys if list of categories
    if isinstance(data, list) and len(data) > 0:
        category = data[0]
        assert isinstance(category, dict), "Category item is not a dict"
    elif isinstance(data, dict):
        assert len(data) > 0, "Response dict is empty"


test_get_api_kategori_list_categories_publicly()