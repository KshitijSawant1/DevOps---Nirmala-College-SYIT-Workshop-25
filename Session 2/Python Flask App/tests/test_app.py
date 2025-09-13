from app import app

def test_home():
    client = app.test_client()
    r = client.get("/")
    assert r.status_code == 200
    assert "Hello from Flask" in r.get_data(as_text=True)
