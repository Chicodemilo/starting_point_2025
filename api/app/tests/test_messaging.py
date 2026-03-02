import pytest


def _create_user_and_group(client):
    """Helper: register a user and create a group, return (token, headers, group_id)."""
    resp = client.post('/api/auth/register', json={
        'username': 'msguser1',
        'email': 'msg1@example.com',
        'password': 'password123',
    })
    token = resp.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    resp = client.post('/api/groups', json={
        'name': 'Msg Group',
        'type': 'club',
    }, headers=headers)
    group_id = resp.get_json()['group']['id']
    return token, headers, group_id


def test_create_group_creates_conversation(client, db):
    token, headers, group_id = _create_user_and_group(client)

    resp = client.get('/api/conversations', headers=headers)
    assert resp.status_code == 200
    convs = resp.get_json()['conversations']
    group_convs = [c for c in convs if c['group_id'] == group_id]
    assert len(group_convs) == 1


def test_send_and_get_messages(client, db):
    token, headers, group_id = _create_user_and_group(client)

    # Get group conversation
    resp = client.get('/api/conversations', headers=headers)
    conv_id = resp.get_json()['conversations'][0]['id']

    # Send a message
    resp = client.post(f'/api/conversations/{conv_id}/messages', json={
        'content': 'Hello world!',
    }, headers=headers)
    assert resp.status_code == 201

    # Get messages
    resp = client.get(f'/api/conversations/{conv_id}/messages', headers=headers)
    assert resp.status_code == 200
    msgs = resp.get_json()['messages']
    assert len(msgs) == 1
    assert msgs[0]['content'] == 'Hello world!'


def test_dm_creation_requires_shared_group(client, db):
    # User 1 with a group
    token1, headers1, group_id = _create_user_and_group(client)

    # User 2 without shared group
    resp = client.post('/api/auth/register', json={
        'username': 'msguser2',
        'email': 'msg2@example.com',
        'password': 'password123',
    })
    token2 = resp.get_json()['token']
    user2_id = resp.get_json()['user']['id']
    headers2 = {'Authorization': f'Bearer {token2}'}

    # User 1 tries to DM user 2 (no shared group)
    resp = client.post('/api/conversations', json={
        'user_id': user2_id,
    }, headers=headers1)
    assert resp.status_code == 400


def test_non_member_cannot_get_messages(client, db):
    token1, headers1, group_id = _create_user_and_group(client)

    resp = client.get('/api/conversations', headers=headers1)
    conv_id = resp.get_json()['conversations'][0]['id']

    # Register a different user
    resp = client.post('/api/auth/register', json={
        'username': 'msgoutsider',
        'email': 'outsider@example.com',
        'password': 'password123',
    })
    token2 = resp.get_json()['token']
    headers2 = {'Authorization': f'Bearer {token2}'}

    resp = client.get(f'/api/conversations/{conv_id}/messages', headers=headers2)
    assert resp.status_code == 403
