# ==============================================================================
# File:      api/app/services/seed_service.py
# Purpose:   Seeds demo users, groups, and memberships for development.
#            Runs once on first boot (skips if users already exist).
# Callers:   app/__init__.py
# Callees:   models/user.py, models/group.py, models/group_member.py,
#            services/messaging_service.py, SQLAlchemy (db),
#            werkzeug.security
# Modified:  2026-03-02
# ==============================================================================
from app import db
from app.models.user import User
from app.models.group import Group
from app.models.group_member import GroupMember
from app.services.messaging_service import MessagingService
from werkzeug.security import generate_password_hash
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

DEMO_USERS = [
    {'username': 'JakeRivera',    'email': 'jake.rivera@example.com'},
    {'username': 'SophiaChen',    'email': 'sophia.chen@example.com'},
    {'username': 'MarcusBell',    'email': 'marcus.bell@example.com'},
    {'username': 'OliviaFrost',   'email': 'olivia.frost@example.com'},
    {'username': 'DanteWilson',   'email': 'dante.wilson@example.com'},
    {'username': 'NoraPatek',     'email': 'nora.patek@example.com'},
    {'username': 'EthanKowalski', 'email': 'ethan.kowalski@example.com'},
    {'username': 'LunaMorales',   'email': 'luna.morales@example.com'},
    {'username': 'CalebDunn',     'email': 'caleb.dunn@example.com'},
]

DEMO_GROUPS = [
    {'name': 'Friday Night Crew',  'type': 'group', 'description': 'Weekend hangouts and game nights.', 'is_private': False},
    {'name': 'Hiking Club',        'type': 'club',  'description': 'Trail runs and day hikes around the city.', 'is_private': False},
    {'name': 'Fantasy League',     'type': 'league', 'description': 'Season-long fantasy football league.', 'is_private': True},
]

# Map: group index -> list of user indices (0-based into DEMO_USERS)
# Miles (admin, user 1) is added to groups 0 and 1
GROUP_MEMBERS = {
    0: [0, 1, 3, 5, 7],        # Friday Night Crew: Jake, Sophia, Olivia, Nora, Luna
    1: [1, 2, 4, 6, 8],        # Hiking Club: Sophia, Marcus, Dante, Ethan, Caleb
    2: [0, 2, 3, 6, 7, 8],     # Fantasy League: Jake, Marcus, Olivia, Ethan, Luna, Caleb
}

MILES_IN_GROUPS = [0, 1]  # Friday Night Crew, Hiking Club


def seed_demo_data():
    """Seed demo users, groups, and memberships. Skips if data already exists."""
    if User.query.filter(User.is_admin == False).count() > 0:
        logger.info("Demo data already exists, skipping seed")
        return

    admin = User.query.filter_by(is_admin=True).first()
    if not admin:
        logger.warning("No admin user found, skipping demo seed")
        return

    # Create demo users
    users = []
    for u in DEMO_USERS:
        user = User(
            username=u['username'],
            email=u['email'],
            password_hash=generate_password_hash('DemoPass123!'),
            email_verified=True,
            terms_accepted=True,
            terms_accepted_at=datetime.utcnow()
        )
        db.session.add(user)
        users.append(user)

    db.session.flush()  # get IDs assigned
    logger.info(f"Seeded {len(users)} demo users")

    # Create groups (owned by admin/Miles)
    groups = []
    for g in DEMO_GROUPS:
        group = Group(
            name=g['name'],
            description=g['description'],
            type=g['type'],
            is_private=g['is_private'],
            owner_id=admin.id
        )
        group.generate_invite_code()
        db.session.add(group)
        groups.append(group)

    db.session.flush()

    # Add Miles as owner member of all his groups, regular member of rest
    for gi in MILES_IN_GROUPS:
        db.session.add(GroupMember(
            group_id=groups[gi].id,
            user_id=admin.id,
            role='owner'
        ))

    # Add demo users to groups
    for gi, user_indices in GROUP_MEMBERS.items():
        for ui in user_indices:
            db.session.add(GroupMember(
                group_id=groups[gi].id,
                user_id=users[ui].id,
                role='member'
            ))

    db.session.commit()

    # Create group conversations
    for gi, group in enumerate(groups):
        member_ids = [users[ui].id for ui in GROUP_MEMBERS[gi]]
        if gi in MILES_IN_GROUPS:
            member_ids.append(admin.id)
        MessagingService.create_group_conversation(group.id, group.name, member_ids)

    logger.info(f"Seeded {len(groups)} groups with memberships")
