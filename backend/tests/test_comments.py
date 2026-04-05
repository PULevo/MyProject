# backend/tests/test_comments.py
from tests.conftest import register_and_login, auth_headers


def _setup(client):
    """Returns (admin_headers, member_headers, org_id, project_id, task_id)"""
    admin_token = register_and_login(client, "admin@x.fi", "salasana")
    member_token = register_and_login(client, "member@x.fi", "salasana")
    ah = auth_headers(admin_token)
    mh = auth_headers(member_token)
    member_id = client.get("/users/me", headers=mh).json()["id"]
    org_id = client.post("/orgs", json={"name": "Org"}, headers=ah).json()["id"]
    client.post(f"/orgs/{org_id}/members", json={"user_id": member_id, "role": "member"}, headers=ah)
    project_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P"}, headers=ah).json()["id"]
    task_id = client.post(
        f"/projects/{project_id}/tasks",
        json={"title": "T", "priority": "high", "due_date": "2026-06-01"},
        headers=ah,
    ).json()["id"]
    return ah, mh, org_id, project_id, task_id


# ── Task fields ───────────────────────────────────────────────────────────────

def test_task_created_with_priority_and_due_date(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.get(f"/tasks/{task_id}", headers=ah)
    assert resp.status_code == 200
    data = resp.json()
    assert data["priority"] == "high"
    assert data["due_date"] == "2026-06-01"


def test_task_priority_defaults_to_medium(client):
    ah, _, org_id, project_id, _ = _setup(client)
    task_id = client.post(
        f"/projects/{project_id}/tasks", json={"title": "No priority"}, headers=ah
    ).json()["id"]
    resp = client.get(f"/tasks/{task_id}", headers=ah)
    assert resp.json()["priority"] == "medium"


def test_update_task_due_date_and_priority(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.patch(
        f"/tasks/{task_id}",
        json={"priority": "low", "due_date": "2026-12-31"},
        headers=ah,
    )
    assert resp.status_code == 200
    assert resp.json()["priority"] == "low"
    assert resp.json()["due_date"] == "2026-12-31"


# ── Comments ──────────────────────────────────────────────────────────────────

def test_member_can_add_comment(client):
    ah, mh, org_id, project_id, task_id = _setup(client)
    resp = client.post(f"/tasks/{task_id}/comments", json={"body": "Hei!"}, headers=mh)
    assert resp.status_code == 201
    assert resp.json()["body"] == "Hei!"


def test_list_comments(client):
    ah, mh, _, _, task_id = _setup(client)
    client.post(f"/tasks/{task_id}/comments", json={"body": "Eka"}, headers=ah)
    client.post(f"/tasks/{task_id}/comments", json={"body": "Toka"}, headers=mh)
    resp = client.get(f"/tasks/{task_id}/comments", headers=ah)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_user_can_delete_own_comment(client):
    ah, mh, _, _, task_id = _setup(client)
    comment_id = client.post(f"/tasks/{task_id}/comments", json={"body": "Poista"}, headers=mh).json()["id"]
    resp = client.delete(f"/comments/{comment_id}", headers=mh)
    assert resp.status_code == 204


def test_user_cannot_delete_others_comment(client):
    ah, mh, _, _, task_id = _setup(client)
    comment_id = client.post(f"/tasks/{task_id}/comments", json={"body": "Admin kirjoitti"}, headers=ah).json()["id"]
    resp = client.delete(f"/comments/{comment_id}", headers=mh)
    assert resp.status_code == 403


def test_admin_can_delete_any_comment(client):
    ah, mh, _, _, task_id = _setup(client)
    comment_id = client.post(f"/tasks/{task_id}/comments", json={"body": "Member kirjoitti"}, headers=mh).json()["id"]
    resp = client.delete(f"/comments/{comment_id}", headers=ah)
    assert resp.status_code == 204


# ── Profile update ────────────────────────────────────────────────────────────

def test_update_profile_name(client):
    token = register_and_login(client, "user@x.fi", "salasana")
    resp = client.patch("/users/me", json={"name": "Uusi Nimi"}, headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["name"] == "Uusi Nimi"


def test_change_password_requires_current_password(client):
    token = register_and_login(client, "user2@x.fi", "salasana")
    resp = client.patch(
        "/users/me",
        json={"new_password": "uusisalasana"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 400


def test_change_password_wrong_current(client):
    token = register_and_login(client, "user3@x.fi", "salasana")
    resp = client.patch(
        "/users/me",
        json={"current_password": "väärä", "new_password": "uusisalasana"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 400


def test_change_password_success(client):
    token = register_and_login(client, "user4@x.fi", "salasana")
    resp = client.patch(
        "/users/me",
        json={"current_password": "salasana", "new_password": "uusisalasana"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 200
    # Login with new password works
    login_resp = client.post(
        "/auth/login", data={"username": "user4@x.fi", "password": "uusisalasana"}
    )
    assert login_resp.status_code == 200


# ── My Tasks ──────────────────────────────────────────────────────────────────

def test_my_tasks_returns_assigned_tasks(client):
    ah, mh, org_id, project_id, task_id = _setup(client)
    member_id = client.get("/users/me", headers=mh).json()["id"]
    client.patch(f"/tasks/{task_id}", json={"assigned_to": member_id}, headers=ah)
    resp = client.get("/users/me/tasks", headers=mh)
    assert resp.status_code == 200
    assert any(t["id"] == task_id for t in resp.json())


# ── Search ────────────────────────────────────────────────────────────────────

def test_search_by_title(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.get(f"/orgs/{org_id}/tasks/search?q=T", headers=ah)
    assert resp.status_code == 200
    assert any(t["id"] == task_id for t in resp.json())


def test_search_by_priority(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.get(f"/orgs/{org_id}/tasks/search?priority=high", headers=ah)
    assert resp.status_code == 200
    assert any(t["id"] == task_id for t in resp.json())


def test_search_outsider_forbidden(client):
    ah, _, org_id, _, _ = _setup(client)
    outsider = auth_headers(register_and_login(client, "out@x.fi", "salasana"))
    resp = client.get(f"/orgs/{org_id}/tasks/search?q=T", headers=outsider)
    assert resp.status_code == 403


def test_non_member_cannot_list_comments(client):
    ah, _, _, _, task_id = _setup(client)
    outsider = auth_headers(register_and_login(client, "outsider1@x.fi", "salasana"))
    resp = client.get(f"/tasks/{task_id}/comments", headers=outsider)
    assert resp.status_code == 403


def test_non_member_cannot_post_comment(client):
    ah, _, _, _, task_id = _setup(client)
    outsider = auth_headers(register_and_login(client, "outsider2@x.fi", "salasana"))
    resp = client.post(f"/tasks/{task_id}/comments", json={"body": "Hei!"}, headers=outsider)
    assert resp.status_code == 403
