from app import db
from app.models.item import Item
import logging

logger = logging.getLogger(__name__)


class ItemService:
    """Handles item CRUD operations"""

    @staticmethod
    def create_item(title, description, user_id, group_id=None):
        """Create a new item"""
        item = Item(
            title=title,
            description=description,
            user_id=user_id,
            group_id=group_id
        )
        db.session.add(item)
        db.session.commit()
        logger.info(f"Item created: {title} by user {user_id}")
        return item

    @staticmethod
    def get_item(item_id):
        """Get an item by ID"""
        return Item.query.get(item_id)

    @staticmethod
    def get_items(page=1, per_page=20, group_id=None, user_id=None):
        """Get items with optional filtering and pagination"""
        query = Item.query

        if group_id:
            query = query.filter_by(group_id=group_id)
        if user_id:
            query = query.filter_by(user_id=user_id)

        query = query.order_by(Item.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'items': [item.to_dict() for item in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page
        }

    @staticmethod
    def update_item(item_id, user_id, **kwargs):
        """Update an item (must be owner)"""
        item = Item.query.get(item_id)
        if not item:
            return None, 'Item not found'
        if item.user_id != user_id:
            return None, 'Permission denied'

        for key, value in kwargs.items():
            if hasattr(item, key) and key not in ('id', 'user_id', 'created_at'):
                setattr(item, key, value)

        db.session.commit()
        return item, None

    @staticmethod
    def delete_item(item_id, user_id, is_admin=False):
        """Delete an item (owner or admin)"""
        item = Item.query.get(item_id)
        if not item:
            return False, 'Item not found'
        if item.user_id != user_id and not is_admin:
            return False, 'Permission denied'

        db.session.delete(item)
        db.session.commit()
        logger.info(f"Item deleted: {item.title} by user {user_id}")
        return True, None
