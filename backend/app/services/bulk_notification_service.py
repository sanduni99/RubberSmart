from sqlalchemy.orm import Session
from app.models import User
from app.services.email_service import send_email_notification
import logging

logger = logging.getLogger(__name__)


def send_email_to_all_users(db: Session, subject: str, message: str):

    users = db.query(User).all()

    total = len(users)
    success = 0
    failed = 0

    logger.info(f"📧 Sending emails to {total} users")

    for user in users:

        if not user.email:
            continue

        result = send_email_notification(
            user.email,
            subject,
            message
        )

        if result:
            success += 1
        else:
            failed += 1

    logger.info(f"✅ Success: {success}")
    logger.info(f"❌ Failed: {failed}")

    return {
        "total": total,
        "success": success,
        "failed": failed
    }
