def test_create_group(client, db, auth_headers):
    resp = client.post('/api/groups', json={
        'name': 'Test Group',
        'description': 'A test group',
        'type': 'club',
        'is_private': True,
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['group']['name'] == 'Test Group'
    assert data['group']['is_private'] is True


def test_get_groups(client, db, auth_headers):
    client.post('/api/groups', json={
        'name': 'Group A', 'type': 'club',
    }, headers=auth_headers)
    resp = client.get('/api/groups', headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data['groups']) >= 1


def test_join_group_with_invite(client, db, auth_headers):
    # Create a group
    create = client.post('/api/groups', json={
        'name': 'Invite Group', 'type': 'club',
    }, headers=auth_headers)
    group = create.get_json()['group']
    invite_code = group.get('invite_code')

    if invite_code:
        # Register a second user
        client.post('/api/auth/register', json={
            'username': 'joiner',
            'email': 'joiner@example.com',
            'password': 'password123',
        })
        login = client.post('/api/auth/login', json={
            'username': 'joiner',
            'password': 'password123',
        })
        joiner_headers = {'Authorization': f'Bearer {login.get_json()["token"]}'}

        resp = client.post('/api/groups/join', json={
            'invite_code': invite_code,
        }, headers=joiner_headers)
        assert resp.status_code in (200, 201)


def test_get_group_types(client):
    resp = client.get('/api/config/group-types')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'types' in data
    assert len(data['types']) > 0
