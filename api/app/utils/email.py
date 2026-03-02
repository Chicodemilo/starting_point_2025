import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def send_verification_email(to_email, token, username):
    """Send verification email. Falls back to console logging if SMTP is not configured."""
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3151')
    verify_url = f"{frontend_url}/verify-email?token={token}"
    app_name = os.getenv('APP_NAME', 'My App')

    smtp_host = os.getenv('SMTP_HOST')
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    from_email = os.getenv('SMTP_FROM_EMAIL', smtp_user or f'noreply@{app_name.lower().replace(" ", "")}.com')

    subject = f"Verify your email — {app_name}"
    html_body = f"""
    <h2>Welcome to {app_name}, {username}!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="{verify_url}">Verify Email</a></p>
    <p>Or copy this URL into your browser:</p>
    <p>{verify_url}</p>
    <p>This link will work for your account verification.</p>
    """

    if not smtp_host or not smtp_user or not smtp_password:
        logger.info("=" * 60)
        logger.info("  EMAIL VERIFICATION (Dev Mode — No SMTP configured)")
        logger.info(f"  To: {to_email}")
        logger.info(f"  Subject: {subject}")
        logger.info(f"  Verification URL: {verify_url}")
        logger.info("=" * 60)
        print("\n" + "=" * 60)
        print("  EMAIL VERIFICATION (Dev Mode)")
        print(f"  User: {username} ({to_email})")
        print(f"  Verify URL: {verify_url}")
        print("=" * 60 + "\n")
        return True

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())

        logger.info(f"Verification email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")
        return False
