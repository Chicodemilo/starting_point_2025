from app import db
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.user import User
from app.config.group_types import is_valid_type
from app.services.messaging_service import MessagingService
from app.utils.email import send_group_invite_email
import logging

logger = logging.getLogger(__name__)


class GroupService:
    """Handles group CRUD, membership, and invite operations"""

    @staticmethod
    def create_group(name, description, group_type, owner_id, is_private=True):
        """Create a new group and add owner as first member"""
        if not is_valid_type(group_type):
            return None, f'Invalid group type: {group_type}'

        group = Group(
            name=name,
            description=description,
            type=group_type,
            is_private=is_private,
            owner_id=owner_id
        )
        group.generate_invite_code()
        db.session.add(group)
        db.session.flush()

        # Add owner as member with 'owner' role
        member = GroupMember(
            group_id=group.id,
            user_id=owner_id,
            role='owner'
        )
        db.session.add(member)
        db.session.commit()

        # Auto-create group conversation
        MessagingService.create_group_conversation(group.id, name, [owner_id])

        logger.info(f"Group created: {name} by user {owner_id}")
        return group, None

    @staticmethod
    def get_group(group_id):
        """Get a group by ID"""
        return Group.query.get(group_id)

    @staticmethod
    def get_user_groups(user_id):
        """Get all groups a user belongs to"""
        memberships = GroupMember.query.filter_by(user_id=user_id).all()
        group_ids = [m.group_id for m in memberships]
        return Group.query.filter(Group.id.in_(group_ids)).all() if group_ids else []

    @staticmethod
    def get_public_groups():
        """Get all public groups"""
        return Group.query.filter_by(is_private=False).all()

    @staticmethod
    def update_group(group_id, user_id, **kwargs):
        """Update a group (owner/admin only)"""
        group = Group.query.get(group_id)
        if not group:
            return None, 'Group not found'

        member = GroupMember.query.filter_by(
            group_id=group_id, user_id=user_id
        ).first()
        if not member or member.role not in ('owner', 'admin'):
            return None, 'Permission denied'

        if 'type' in kwargs and not is_valid_type(kwargs['type']):
            return None, f'Invalid group type: {kwargs["type"]}'

        for key, value in kwargs.items():
            if hasattr(group, key) and key not in ('id', 'owner_id', 'created_at'):
                setattr(group, key, value)

        db.session.commit()
        return group, None

    @staticmethod
    def delete_group(group_id, user_id):
        """Delete a group (owner only)"""
        group = Group.query.get(group_id)
        if not group:
            return False, 'Group not found'
        if group.owner_id != user_id:
            return False, 'Only the group owner can delete a group'

        db.session.delete(group)
        db.session.commit()
        logger.info(f"Group deleted: {group.name} by user {user_id}")
        return True, None

    @staticmethod
    def join_by_invite(invite_code, user_id):
        """Join a group using an invite code"""
        group = Group.query.filter_by(invite_code=invite_code).first()
        if not group:
            return None, 'Invalid invite code'

        existing = GroupMember.query.filter_by(
            group_id=group.id, user_id=user_id
        ).first()
        if existing:
            return None, 'Already a member of this group'

        member = GroupMember(
            group_id=group.id,
            user_id=user_id,
            role='member'
        )
        db.session.add(member)
        db.session.commit()

        # Add to group conversation
        MessagingService.add_member_to_group_conversation(group.id, user_id)

        logger.info(f"User {user_id} joined group {group.name} via invite")
        return group, None

    @staticmethod
    def add_member(group_id, user_id, requester_id, role='member'):
        """Add a member to a group (owner/admin only)"""
        requester = GroupMember.query.filter_by(
            group_id=group_id, user_id=requester_id
        ).first()
        if not requester or requester.role not in ('owner', 'admin'):
            return None, 'Permission denied'

        existing = GroupMember.query.filter_by(
            group_id=group_id, user_id=user_id
        ).first()
        if existing:
            return None, 'User is already a member'

        member = GroupMember(
            group_id=group_id,
            user_id=user_id,
            role=role
        )
        db.session.add(member)
        db.session.commit()

        # Add to group conversation
        MessagingService.add_member_to_group_conversation(group_id, user_id)

        return member, None

    @staticmethod
    def update_member_role(group_id, user_id, new_role, requester_id):
        """Update a member's role (owner only)"""
        group = Group.query.get(group_id)
        if not group or group.owner_id != requester_id:
            return None, 'Only the group owner can change roles'

        member = GroupMember.query.filter_by(
            group_id=group_id, user_id=user_id
        ).first()
        if not member:
            return None, 'Member not found'

        member.role = new_role
        db.session.commit()
        return member, None

    @staticmethod
    def remove_member(group_id, user_id, requester_id):
        """Remove a member from a group (owner/admin, or self to leave)"""
        if user_id != requester_id:
            requester = GroupMember.query.filter_by(
                group_id=group_id, user_id=requester_id
            ).first()
            if not requester or requester.role not in ('owner', 'admin'):
                return False, 'Permission denied'

        member = GroupMember.query.filter_by(
            group_id=group_id, user_id=user_id
        ).first()
        if not member:
            return False, 'Member not found'

        # Prevent owner from leaving their own group
        group = Group.query.get(group_id)
        if group.owner_id == user_id:
            return False, 'Owner cannot leave the group. Transfer ownership or delete the group.'

        db.session.delete(member)
        db.session.commit()
        return True, None

    @staticmethod
    def invite_member_by_email(group_id, email, requester_id):
        """Invite a user to a group by email. If user exists, add them. If not, send invite email."""
        requester = GroupMember.query.filter_by(
            group_id=group_id, user_id=requester_id
        ).first()
        if not requester or requester.role not in ('owner', 'admin'):
            return None, 'Permission denied'

        group = Group.query.get(group_id)
        if not group:
            return None, 'Group not found'

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            already = GroupMember.query.filter_by(
                group_id=group_id, user_id=existing_user.id
            ).first()
            if already:
                return None, 'User is already a member'
            member = GroupMember(group_id=group_id, user_id=existing_user.id, role='member')
            db.session.add(member)
            db.session.commit()
            MessagingService.add_member_to_group_conversation(group_id, existing_user.id)
            return {'message': 'User added to group', 'member': member.to_dict(), 'status': 'added'}, None
        else:
            send_group_invite_email(email, group.name, group.invite_code)
            return {'message': f'Invite sent to {email}', 'status': 'invited'}, None

    @staticmethod
    def regenerate_invite(group_id, requester_id):
        """Regenerate invite code (owner/admin only)"""
        member = GroupMember.query.filter_by(
            group_id=group_id, user_id=requester_id
        ).first()
        if not member or member.role not in ('owner', 'admin'):
            return None, 'Permission denied'

        group = Group.query.get(group_id)
        group.generate_invite_code()
        db.session.commit()
        return group.invite_code, None
