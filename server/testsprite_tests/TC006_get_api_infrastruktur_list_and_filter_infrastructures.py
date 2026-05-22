import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_infrastruktur_list_and_filter():
    try:
        # 1. Public GET /api/infrastruktur without filters
        url = f"{BASE_URL}/api/infrastruktur"
        resp_public = requests.get(url, timeout=TIMEOUT)
        assert resp_public.status_code == 200, f"Expected 200, got {resp_public.status_code}"
        data_public = resp_public.json()
        assert isinstance(data_public, dict), "Response should be a JSON object"
        assert "data" in data_public or "items" in data_public or "results" in data_public or "list" in data_public or isinstance(data_public, list), "Response structure unexpected"

        # 2. GET /api/infrastruktur with query parameters filter: search by name, category, kecamatan
        params = {
            "search": "nama",
            "kategori": "restoran",
            "kdkec": "130501"
        }
        resp_filtered = requests.get(url, params=params, timeout=TIMEOUT)
        assert resp_filtered.status_code == 200, f"Expected 200, got {resp_filtered.status_code}"
        data_filtered = resp_filtered.json()
        assert isinstance(data_filtered, dict) or isinstance(data_filtered, list), "Response should be a JSON object or list"

        # Validate that filtered results correspond to filter params if data present
        results = None
        if isinstance(data_filtered, dict):
            # Possible keys: data, items, results, list
            for key in ("data", "items", "results", "list"):
                if key in data_filtered:
                    results = data_filtered[key]
                    break
            if results is None and isinstance(data_filtered.get("page"), int) and isinstance(data_filtered.get("perPage"), int):
                results = data_filtered.get("data", [])
        else:
            results = data_filtered

        # Only assert structure if results is a list
        assert isinstance(results, list) or results is None, "Filtered results should be a list or None"

        # Optional: If results exist, check if returned items match filters on name or category or kecamatan (best effort)
        if results:
            for item in results:
                if not isinstance(item, dict):
                    continue
                nama = item.get("nama") or item.get("name") or ""
                kategori = item.get("kategori") or item.get("category") or ""
                kdkec = item.get("kdkec") or item.get("kecamatan") or ""
                assert "nama".lower() in nama.lower() or "restoran" in kategori.lower() or "130501" == kdkec, \
                    "Filtered item does not match filter criteria"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_infrastruktur_list_and_filter()
