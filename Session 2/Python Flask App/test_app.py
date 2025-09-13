from app import app

def test_home():
    c = app.test_client()
    r = c.get("/")
    assert r.status_code == 200
    assert "Hello from Flask" in r.get_data(as_text=True)
