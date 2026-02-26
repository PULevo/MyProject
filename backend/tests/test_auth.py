def test_register_ok(client):
    resp = client.post("/auth/register", json={"email": "a@b.com", "password": "salasana123"})
    assert resp.status_code == 201

def test_register_duplicate(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "salasana123"})
    resp = client.post("/auth/register", json={"email": "a@b.com", "password": "salasana123"})
    assert resp.status_code == 409

def test_login_ok(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "salasana123"})
    resp = client.post("/auth/login", data={"username": "a@b.com", "password": "salasana123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()

def test_login_wrong_password(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "salasana123"})
    resp = client.post("/auth/login", data={"username": "a@b.com", "password": "vaara"})
    assert resp.status_code == 401

def test_get_me(client):
    from tests.conftest import register_and_login, auth_headers
    token = register_and_login(client)
    resp = client.get("/users/me", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["email"] == "testi@testi.fi"
