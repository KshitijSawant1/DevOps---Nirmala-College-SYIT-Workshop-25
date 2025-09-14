from app import app

def test_home_status():
    c = app.test_client()
    r = c.get("/")
    assert r.status_code == 200

def test_health_endpoint():
    c = app.test_client()
    r = c.get("/health")
    assert r.status_code == 200
    assert r.json["status"] == "ok"
