import requests
from requests.auth import HTTPBasicAuth
import io

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
USERNAME = "admin"
PASSWORD = "admin123"

def get_jwt_token():
    url = f"{BASE_URL}/api/auth/login"
    payload = {"username": USERNAME, "password": PASSWORD}
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    token = resp.json().get("token")
    assert token, "JWT token not found in login response"
    return token

def test_post_api_upload_with_valid_jwt_and_validation():
    token = get_jwt_token()
    headers_auth = {"Authorization": f"Bearer {token}"}

    url_upload = f"{BASE_URL}/api/upload"
    # Supported file (small PNG image bytes)
    supported_file_content = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00"
        b"\x00\x00\nIDATx\xdacd\xf8\x0f\x00\x01\x01\x01\x00"
        b"\x18\xdd\x18\x1d\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    supported_files = {
        "file": ("test.png", io.BytesIO(supported_file_content), "image/png")
    }

    # Unsupported file type (text file)
    unsupported_file_content = b"Just some text content"
    unsupported_files = {
        "file": ("test.txt", io.BytesIO(unsupported_file_content), "text/plain")
    }

    # Oversized file: create ~6MB of data, assuming max allowed < 6MB
    oversized_content = b"0" * (6 * 1024 * 1024)  # 6 MB
    oversized_files = {
        "file": ("large.png", io.BytesIO(oversized_content), "image/png")
    }

    # 1. Test upload with valid JWT and supported file: expect 200
    resp = requests.post(url_upload, headers=headers_auth, files=supported_files, timeout=TIMEOUT)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    json_resp = resp.json()
    # Expect response to contain some file path or metadata (string or dict)
    assert isinstance(json_resp, dict) and ("path" in json_resp or "filename" in json_resp or "url" in json_resp or len(json_resp) > 0), "Unexpected response content for valid upload"

    # 2. Test upload with valid JWT and unsupported file type: expect 400
    resp = requests.post(url_upload, headers=headers_auth, files=unsupported_files, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 for unsupported file type, got {resp.status_code}"

    # 3. Test upload with valid JWT and oversized file: expect 400
    resp = requests.post(url_upload, headers=headers_auth, files=oversized_files, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 for oversized file, got {resp.status_code}"

    # 4. Test upload without JWT and supported file: expect 401
    resp = requests.post(url_upload, files=supported_files, timeout=TIMEOUT)
    assert resp.status_code == 401, f"Expected 401 unauthorized without JWT, got {resp.status_code}"

test_post_api_upload_with_valid_jwt_and_validation()
