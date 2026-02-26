from tests.conftest import register_and_login, auth_headers


def _setup_org_with_member(client):
    """Palauttaa (admin_headers, member_headers, org_id)"""
    admin_token = register_and_login(client, "admin@x.fi", "salasana")
    member_token = register_and_login(client, "member@x.fi", "salasana")
    ah = auth_headers(admin_token)
    mh = auth_headers(member_token)
    member_id = client.get("/users/me", headers=mh).json()["id"]
    org_id = client.post("/orgs", json={"name": "Org"}, headers=ah).json()["id"]
    client.post(f"/orgs/{org_id}/members", json={"user_id": member_id, "role": "member"}, headers=ah)
    return ah, mh, org_id


def test_admin_can_create_project(client):
    ah, _, org_id = _setup_org_with_member(client)
    resp = client.post(f"/orgs/{org_id}/projects", json={"name": "P1", "description": ""}, headers=ah)
    assert resp.status_code == 201


def test_member_cannot_create_project(client):
    ah, mh, org_id = _setup_org_with_member(client)
    resp = client.post(f"/orgs/{org_id}/projects", json={"name": "P1", "description": ""}, headers=mh)
    assert resp.status_code == 403


def test_member_can_create_task(client):
    ah, mh, org_id = _setup_org_with_member(client)
    project_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P1", "description": ""}, headers=ah).json()["id"]
    resp = client.post(f"/projects/{project_id}/tasks", json={"title": "T1", "description": ""}, headers=mh)
    assert resp.status_code == 201


def test_admin_can_delete_project(client):
    ah, _, org_id = _setup_org_with_member(client)
    project_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P1", "description": ""}, headers=ah).json()["id"]
    resp = client.delete(f"/projects/{project_id}", headers=ah)
    assert resp.status_code == 204


def test_member_cannot_delete_project(client):
    ah, mh, org_id = _setup_org_with_member(client)
    project_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P1", "description": ""}, headers=ah).json()["id"]
    resp = client.delete(f"/projects/{project_id}", headers=mh)
    assert resp.status_code == 403


def test_outsider_cannot_list_projects(client):
    ah, _, org_id = _setup_org_with_member(client)
    outsider_token = register_and_login(client, "out@x.fi", "salasana")
    resp = client.get(f"/orgs/{org_id}/projects", headers=auth_headers(outsider_token))
    assert resp.status_code == 403
