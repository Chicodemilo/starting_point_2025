def test_create_item(client, db, auth_headers):
    resp = client.post('/api/items', json={
        'title': 'Test Item',
        'description': 'A test item',
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['item']['title'] == 'Test Item'


def test_get_items(client, db, auth_headers):
    client.post('/api/items', json={'title': 'Item 1'}, headers=auth_headers)
    client.post('/api/items', json={'title': 'Item 2'}, headers=auth_headers)
    resp = client.get('/api/items', headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data['items']) >= 2


def test_update_item(client, db, auth_headers):
    create = client.post('/api/items', json={'title': 'Old'}, headers=auth_headers)
    item_id = create.get_json()['item']['id']
    resp = client.put(f'/api/items/{item_id}', json={'title': 'New'}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()['item']['title'] == 'New'


def test_delete_item(client, db, auth_headers):
    create = client.post('/api/items', json={'title': 'Delete Me'}, headers=auth_headers)
    item_id = create.get_json()['item']['id']
    resp = client.delete(f'/api/items/{item_id}', headers=auth_headers)
    assert resp.status_code == 200


def test_create_item_unauthorized(client, db):
    resp = client.post('/api/items', json={'title': 'Nope'})
    assert resp.status_code == 401
