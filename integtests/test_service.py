import requests
import os


def test_200_response():
    with requests.get(os.environ['ENDPOINT_URL']) as response:
        assert response.status_code == 200
