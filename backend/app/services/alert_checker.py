# app/services/alert_checker.py

from sqlalchemy.orm import Session
from app.models import PriceAlert, Price, User
from app.database import SessionLocal
from datetime import datetime
import logging

# Import email service
from app.services.email_service import send_price_alert_email

logger = logging.getLogger(__name__)

def check_price_alerts():
    db = SessionLocal()

    try:
        logger.info("🔍 Checking price alerts...")

        active_alerts = db.query(PriceAlert).filter(
            PriceAlert.is_active == True,
            PriceAlert.is_triggered == False
        ).all()

        if not active_alerts:
            logger.info("   No active alerts to check")
            return

        logger.info(f"   Found {len(active_alerts)} active alerts")

        latest_price = db.query(Price).order_by(Price.Year.desc()).first()

        if not latest_price:
            logger.warning("No price data")
            return

        current_market_price = latest_price.Price_per_Liter_LKR

        triggered_count = 0

        for alert in active_alerts:

            current_price = current_market_price   # ✅ FIXED

            should_trigger = False

            if alert.alert_type == "above" and current_price >= alert.target_price:
                should_trigger = True

            elif alert.alert_type == "below" and current_price <= alert.target_price:
                should_trigger = True

            if should_trigger:
                alert.is_triggered = True
                alert.triggered_at = datetime.utcnow()
                triggered_count += 1

                send_alert_notification(alert, current_price, db)

        db.commit()
        logger.info(f"✅ Checked {len(active_alerts)} alerts, triggered {triggered_count}")

    except Exception as e:
        logger.error(f"❌ Error checking alerts: {str(e)}")
        db.rollback()

    finally:
        db.close()



def send_alert_notification(alert: PriceAlert, current_price: float, db: Session):
    """Send email notification when alert is triggered"""
    
    # Get user info
    user = db.query(User).filter(User.id == alert.user_id).first()
    
    if not user or not user.email:
        logger.warning(f"   User {alert.user_id} has no email address")
        return
    
    # Check if email alerts are enabled
    import os
    if os.getenv('ENABLE_EMAIL_ALERTS', 'true').lower() != 'true':
        logger.info(f"   Email alerts disabled in .env")
        return
    
    # Only send email if user opted in
    if not alert.notify_email:
        logger.info(f"   User {user.id} opted out of email notifications")
        return
    
    # Prepare alert data
    alert_data = {
        'rubber_type': alert.rubber_type,
        'current_price': current_price,
        'target_price': alert.target_price,
        'alert_type': alert.alert_type
    }
    
    # Send email
    logger.info(f"   📧 Sending email to {user.email}...")
    success = send_price_alert_email(user.email, alert_data)
    
    if success:
        logger.info(f"   ✅ Email sent to {user.email}")
    else:
        logger.error(f"   ❌ Failed to send email to {user.email}")