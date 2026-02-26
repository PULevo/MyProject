from tests.conftest import register_and_login, auth_headers


def test_create_org(client):
    token = register_and_login(client)
    resp = client.post("/orgs", json={"name": "Testi Org"}, headers=auth_headers(token))
    assert resp.status_code == 201
    assert resp.json()["name"] == "Testi Org"


def test_list_orgs(client):
    token = register_and_login(client)
    h = auth_headers(token)
    client.post("/orgs", json={"name": "Org 1"}, headers=h)
    client.post("/orgs", json={"name": "Org 2"}, headers=h)
    resp = client.get("/orgs", headers=h)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_add_member_as_admin(client):
    admin_token = register_and_login(client, "admin@x.fi", "salasana")
    member_token = register_and_login(client, "member@x.fi", "salasana")
    member_id = client.get("/users/me", headers=auth_headers(member_token)).json()["id"]

    org_id = client.post("/orgs", json={"name": "Org"}, headers=auth_headers(admin_token)).json()["id"]
    resp = client.post(
        f"/orgs/{org_id}/members",
        json={"user_id": member_id, "role": "member"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 201


def test_add_member_as_member_forbidden(client):
    admin_token = register_and_login(client, "admin@x.fi", "salasana")
    member_token = register_and_login(client, "member@x.fi", "salasana")
    outsider_token = register_and_login(client, "out@x.fi", "salasana")
    member_id = client.get("/users/me", headers=auth_headers(member_token)).json()["id"]
    outsider_id = client.get("/users/me", headers=auth_headers(outsider_token)).json()["id"]

    org_id = client.post("/orgs", json={"name": "Org"}, headers=auth_headers(admin_token)).json()["id"]
    client.post(f"/orgs/{org_id}/members", json={"user_id": member_id, "role": "member"}, headers=auth_headers(admin_token))
    resp = client.post(
        f"/orgs/{org_id}/members",
        json={"user_id": outsider_id, "role": "member"},
        headers=auth_headers(member_token),
    )
    assert resp.status_code == 403


def test_remove_member(client):
    admin_token = register_and_login(client, "admin@x.fi", "salasana")
    member_token = register_and_login(client, "member@x.fi", "salasana")
    member_id = client.get("/users/me", headers=auth_headers(member_token)).json()["id"]

    org_id = client.post("/orgs", json={"name": "Org"}, headers=auth_headers(admin_token)).json()["id"]
    client.post(f"/orgs/{org_id}/members", json={"user_id": member_id, "role": "member"}, headers=auth_headers(admin_token))
    resp = client.delete(f"/orgs/{org_id}/members/{member_id}", headers=auth_headers(admin_token))
    assert resp.status_code == 204
