import pytest


def test_create_alert(client, db, auth_headers):
    resp = client.post('/api/alerts', json={
        'title': 'Test Alert',
        'content': 'This is a test',
        'type': 'info',
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['alert']['title'] == 'Test Alert'


def test_get_alerts(client, db, auth_headers):
    # Create an alert first
    client.post('/api/alerts', json={'title': 'Alert 1'}, headers=auth_headers)

    resp = client.get('/api/alerts', headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'alerts' in data


def test_get_unread_count(client, db, auth_headers):
    resp = client.get('/api/alerts/unread-count', headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'unread_count' in data


def test_mark_alert_read(client, db, auth_headers):
    resp = client.post('/api/alerts', json={'title': 'Read Me'}, headers=auth_headers)
    alert_id = resp.get_json()['alert']['id']

    resp = client.put(f'/api/alerts/{alert_id}/read', headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()['alert']['viewed'] is True


def test_delete_alert(client, db, auth_headers):
    resp = client.post('/api/alerts', json={'title': 'Delete Me'}, headers=auth_headers)
    alert_id = resp.get_json()['alert']['id']

    resp = client.delete(f'/api/alerts/{alert_id}', headers=auth_headers)
    assert resp.status_code == 200


def test_alert_scoping_direct(client, db):
    """Alerts sent to a specific user should only be visible to that user."""
    # Register two users
    resp1 = client.post('/api/auth/register', json={
        'username': 'alertuser1', 'email': 'au1@example.com', 'password': 'password123',
    })
    token1 = resp1.get_json()['token']
    user1_id = resp1.get_json()['user']['id']
    headers1 = {'Authorization': f'Bearer {token1}'}

    resp2 = client.post('/api/auth/register', json={
        'username': 'alertuser2', 'email': 'au2@example.com', 'password': 'password123',
    })
    token2 = resp2.get_json()['token']
    headers2 = {'Authorization': f'Bearer {token2}'}

    # User 1 creates a direct alert to themselves
    client.post('/api/alerts', json={
        'title': 'Direct Alert',
        'receiver_id': user1_id,
    }, headers=headers1)

    # User 2 should not see it
    resp = client.get('/api/alerts', headers=headers2)
    direct_alerts = [a for a in resp.get_json()['alerts'] if a['title'] == 'Direct Alert']
    assert len(direct_alerts) == 0
