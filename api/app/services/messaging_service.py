from app import db
from app.models.conversation import Conversation
from app.models.conversation_member import ConversationMember
from app.models.message import Message
from app.models.group_member import GroupMember
from datetime import datetime
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)


class MessagingService:

    @staticmethod
    def get_user_conversations(user_id):
        """Get conversations for a user, with last message and unread count."""
        memberships = ConversationMember.query.filter_by(user_id=user_id).all()
        result = []
        for membership in memberships:
            conv = Conversation.query.get(membership.conversation_id)
            if not conv:
                continue
            last_msg = Message.query.filter_by(conversation_id=conv.id).order_by(Message.created_at.desc()).first()
            unread_count = Message.query.filter(
                Message.conversation_id == conv.id,
                Message.created_at > (membership.last_read_at or datetime.min),
                Message.sender_id != user_id,
            ).count()
            conv_data = conv.to_dict()
            conv_data['last_message'] = last_msg.to_dict() if last_msg else None
            conv_data['unread_count'] = unread_count
            result.append(conv_data)
        result.sort(key=lambda c: c['last_message']['created_at'] if c['last_message'] else c['created_at'], reverse=True)
        return result

    @staticmethod
    def get_messages(conversation_id, user_id, page=1, per_page=50):
        """Get messages for a conversation. Updates last_read_at."""
        membership = ConversationMember.query.filter_by(conversation_id=conversation_id, user_id=user_id).first()
        if not membership:
            return None, 'Not a member of this conversation'

        membership.last_read_at = datetime.utcnow()
        db.session.commit()

        pagination = Message.query.filter_by(conversation_id=conversation_id).order_by(
            Message.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        return {
            'messages': [m.to_dict() for m in reversed(pagination.items)],
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
        }, None

    @staticmethod
    def send_message(conversation_id, sender_id, content):
        membership = ConversationMember.query.filter_by(conversation_id=conversation_id, user_id=sender_id).first()
        if not membership:
            return None, 'Not a member of this conversation'
        if not content or not content.strip():
            return None, 'Message content required'

        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content.strip()
        )
        db.session.add(message)
        membership.last_read_at = datetime.utcnow()
        db.session.commit()
        return message, None

    @staticmethod
    def create_group_conversation(group_id, group_name, member_user_ids):
        """Create a group conversation when a group is created."""
        conv = Conversation(
            type='group',
            group_id=group_id,
            name=group_name,
        )
        db.session.add(conv)
        db.session.flush()

        for uid in member_user_ids:
            member = ConversationMember(conversation_id=conv.id, user_id=uid)
            db.session.add(member)

        db.session.commit()
        logger.info(f"Group conversation created for group {group_id}")
        return conv

    @staticmethod
    def add_member_to_group_conversation(group_id, user_id):
        """Add a user to the group's conversation."""
        conv = Conversation.query.filter_by(group_id=group_id, type='group').first()
        if not conv:
            return
        existing = ConversationMember.query.filter_by(conversation_id=conv.id, user_id=user_id).first()
        if existing:
            return
        member = ConversationMember(conversation_id=conv.id, user_id=user_id)
        db.session.add(member)
        db.session.commit()

    @staticmethod
    def create_direct_conversation(user_id, other_user_id):
        """Create a DM conversation. Both users must share at least one group."""
        # Check shared group membership
        user_groups = set(m.group_id for m in GroupMember.query.filter_by(user_id=user_id).all())
        other_groups = set(m.group_id for m in GroupMember.query.filter_by(user_id=other_user_id).all())
        if not user_groups & other_groups:
            return None, 'You must share a group with this user to send a direct message'

        # Check if DM already exists between these users
        user_convs = set(m.conversation_id for m in ConversationMember.query.filter_by(user_id=user_id).all())
        other_convs = set(m.conversation_id for m in ConversationMember.query.filter_by(user_id=other_user_id).all())
        shared_convs = user_convs & other_convs
        for conv_id in shared_convs:
            conv = Conversation.query.get(conv_id)
            if conv and conv.type == 'direct':
                return conv, None

        conv = Conversation(type='direct')
        db.session.add(conv)
        db.session.flush()
        db.session.add(ConversationMember(conversation_id=conv.id, user_id=user_id))
        db.session.add(ConversationMember(conversation_id=conv.id, user_id=other_user_id))
        db.session.commit()
        return conv, None

    @staticmethod
    def delete_message(message_id, user_id=None, is_admin=False):
        message = Message.query.get(message_id)
        if not message:
            return False, 'Message not found'
        if not is_admin and message.sender_id != user_id:
            return False, 'Permission denied'
        db.session.delete(message)
        db.session.commit()
        return True, None

    @staticmethod
    def get_all_conversations(page=1, per_page=20):
        """Admin: get all conversations."""
        pagination = Conversation.query.order_by(Conversation.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        result = []
        for conv in pagination.items:
            conv_data = conv.to_dict()
            conv_data['member_count'] = conv.members.count()
            conv_data['message_count'] = conv.messages.count()
            result.append(conv_data)
        return {
            'conversations': result,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
        }
