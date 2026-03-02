import pytest


def test_register(client, db):
    resp = client.post('/api/auth/register', json={
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'password123',
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert 'token' in data
    assert data['user']['username'] == 'newuser'


def test_register_duplicate(client, db):
    client.post('/api/auth/register', json={
        'username': 'dup',
        'email': 'dup@example.com',
        'password': 'password123',
    })
    resp = client.post('/api/auth/register', json={
        'username': 'dup',
        'email': 'dup2@example.com',
        'password': 'password123',
    })
    assert resp.status_code == 409


def test_login_success(client, db):
    client.post('/api/auth/register', json={
        'username': 'loginuser',
        'email': 'login@example.com',
        'password': 'password123',
    })
    resp = client.post('/api/auth/login', json={
        'username': 'loginuser',
        'password': 'password123',
    })
    assert resp.status_code == 200
    assert 'token' in resp.get_json()


def test_login_wrong_password(client, db):
    client.post('/api/auth/register', json={
        'username': 'wpuser',
        'email': 'wp@example.com',
        'password': 'password123',
    })
    resp = client.post('/api/auth/login', json={
        'username': 'wpuser',
        'password': 'wrong',
    })
    assert resp.status_code == 401


def test_login_missing_fields(client):
    resp = client.post('/api/auth/login', json={})
    assert resp.status_code in (400, 401)


def test_protected_route_without_token(client):
    resp = client.get('/api/auth/profile')
    assert resp.status_code == 401


def test_set_active_group(client, db):
    # Register + login
    resp = client.post('/api/auth/register', json={
        'username': 'activeuser',
        'email': 'active@example.com',
        'password': 'password123',
    })
    token = resp.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # Create a group
    resp = client.post('/api/groups', json={
        'name': 'Test Group',
        'type': 'club',
    }, headers=headers)
    group_id = resp.get_json()['group']['id']

    # Set active group
    resp = client.put('/api/auth/active-group', json={'group_id': group_id}, headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()['user']['active_group_id'] == group_id


def test_set_active_group_not_member(client, db):
    # Register user 1 and create a group
    resp = client.post('/api/auth/register', json={
        'username': 'owner1',
        'email': 'owner1@example.com',
        'password': 'password123',
    })
    token1 = resp.get_json()['token']
    resp = client.post('/api/groups', json={
        'name': 'Private Group',
        'type': 'club',
    }, headers={'Authorization': f'Bearer {token1}'})
    group_id = resp.get_json()['group']['id']

    # Register user 2 (not a member)
    resp = client.post('/api/auth/register', json={
        'username': 'outsider1',
        'email': 'outsider1@example.com',
        'password': 'password123',
    })
    token2 = resp.get_json()['token']

    # Try to set active group (should fail)
    resp = client.put('/api/auth/active-group', json={'group_id': group_id}, headers={'Authorization': f'Bearer {token2}'})
    assert resp.status_code == 400


def test_clear_active_group(client, db):
    resp = client.post('/api/auth/register', json={
        'username': 'clearuser',
        'email': 'clear@example.com',
        'password': 'password123',
    })
    token = resp.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    resp = client.put('/api/auth/active-group', json={'group_id': None}, headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()['user']['active_group_id'] is None
