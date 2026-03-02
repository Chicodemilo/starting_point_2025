from app import db
from app.models.alert import Alert
from app.models.group_member import GroupMember
from datetime import datetime
from sqlalchemy import or_
import logging

logger = logging.getLogger(__name__)


class AlertService:

    @staticmethod
    def get_alerts_for_user(user_id, page=1, per_page=20):
        """Get alerts scoped to user: direct, group-wide (for user's groups), and system-wide."""
        memberships = GroupMember.query.filter_by(user_id=user_id).all()
        group_ids = [m.group_id for m in memberships]

        now = datetime.utcnow()
        query = Alert.query.filter(
            or_(
                Alert.receiver_id == user_id,
                (Alert.group_id.in_(group_ids)) & (Alert.receiver_id.is_(None)) if group_ids else False,
                (Alert.group_id.is_(None)) & (Alert.receiver_id.is_(None)),
            )
        ).filter(
            or_(Alert.expires_at.is_(None), Alert.expires_at > now)
        ).order_by(Alert.created_at.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            'alerts': [a.to_dict() for a in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
        }

    @staticmethod
    def get_unread_count(user_id):
        memberships = GroupMember.query.filter_by(user_id=user_id).all()
        group_ids = [m.group_id for m in memberships]

        now = datetime.utcnow()
        count = Alert.query.filter(
            or_(
                Alert.receiver_id == user_id,
                (Alert.group_id.in_(group_ids)) & (Alert.receiver_id.is_(None)) if group_ids else False,
                (Alert.group_id.is_(None)) & (Alert.receiver_id.is_(None)),
            )
        ).filter(
            Alert.viewed == False,
            or_(Alert.expires_at.is_(None), Alert.expires_at > now)
        ).count()
        return count

    @staticmethod
    def create_alert(title, content=None, alert_type='info', sender_id=None, group_id=None, receiver_id=None, is_urgent=False, expires_at=None):
        alert = Alert(
            title=title,
            content=content,
            type=alert_type,
            sender_id=sender_id,
            group_id=group_id,
            receiver_id=receiver_id,
            is_urgent=is_urgent,
            expires_at=expires_at,
        )
        db.session.add(alert)
        db.session.commit()
        logger.info(f"Alert created: {title}")
        return alert

    @staticmethod
    def mark_read(alert_id, user_id):
        alert = Alert.query.get(alert_id)
        if not alert:
            return None, 'Alert not found'
        alert.viewed = True
        alert.viewed_at = datetime.utcnow()
        db.session.commit()
        return alert, None

    @staticmethod
    def delete_alert(alert_id):
        alert = Alert.query.get(alert_id)
        if not alert:
            return False, 'Alert not found'
        db.session.delete(alert)
        db.session.commit()
        return True, None

    @staticmethod
    def get_all_alerts(page=1, per_page=20):
        """Admin: get all alerts."""
        pagination = Alert.query.order_by(Alert.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        return {
            'alerts': [a.to_dict() for a in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
        }
