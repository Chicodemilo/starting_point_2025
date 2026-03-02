from app import db
from app.models.user import User
from app.models.group_member import GroupMember
from app.utils.email import send_verification_email
from werkzeug.security import generate_password_hash
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Handles user registration, authentication, verification, and admin seeding"""

    @staticmethod
    def register(username, email, password):
        if User.query.filter_by(username=username).first():
            return None, 'Username already taken'
        if User.query.filter_by(email=email).first():
            return None, 'Email already registered'

        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        token = user.generate_verification_token()
        db.session.add(user)
        db.session.commit()

        send_verification_email(email, token, username)

        logger.info(f"New user registered: {username}")
        return user, None

    @staticmethod
    def verify_email(token):
        if not token:
            return None, 'Verification token required'
        user = User.query.filter_by(verification_token=token).first()
        if not user:
            return None, 'Invalid verification token'
        user.email_verified = True
        user.verification_token = None
        db.session.commit()
        logger.info(f"Email verified for user: {user.username}")
        return user, None

    @staticmethod
    def resend_verification(user_id):
        user = User.query.get(user_id)
        if not user:
            return None, 'User not found'
        if user.email_verified:
            return None, 'Email already verified'
        token = user.generate_verification_token()
        db.session.commit()
        send_verification_email(user.email, token, user.username)
        return user, None

    @staticmethod
    def authenticate(username, password):
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        if user and user.check_password(password):
            logger.info(f"Successful login for user: {user.username}")
            return user
        return None

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def set_active_group(user_id, group_id):
        user = User.query.get(user_id)
        if not user:
            return None, 'User not found'
        if group_id is None:
            user.active_group_id = None
            db.session.commit()
            return user, None
        membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
        if not membership:
            return None, 'You are not a member of this group'
        user.active_group_id = group_id
        db.session.commit()
        return user, None

    @staticmethod
    def seed_admin(username, email, password):
        existing = User.query.filter_by(is_admin=True).first()
        if existing:
            logger.info(f"Admin user already exists: {existing.username}")
            return existing

        admin = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            is_admin=True,
            email_verified=True
        )
        db.session.add(admin)
        db.session.commit()
        logger.info(f"Admin user created: {username}")
        return admin
