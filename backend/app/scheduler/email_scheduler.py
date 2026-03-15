from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.bulk_notification_service import send_email_to_all_users
import logging
from datetime import datetime
from app.routers.predictions import future_price_predictions

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

scheduler_started = False


from app.routers.predictions import future_price_predictions

def daily_email_job():

    print(" Running Daily Email Job...")

    db: Session = SessionLocal()

    try:

        predicted_price = "Not Available"
        predicted_month = ""
        predicted_year = ""

        if future_price_predictions:

            predictions = future_price_predictions.get("predictions", [])

            now = datetime.now()
            current_year = now.year
            current_month = now.month

            for p in predictions:

                pred_year = p.get("year")
                pred_month_name = p.get("month")

                pred_month_num = datetime.strptime(pred_month_name, "%B").month

                if (pred_year > current_year) or (
                    pred_year == current_year and pred_month_num >= current_month
                ):
                    predicted_price = p.get("predicted_price_lkr", "N/A")
                    predicted_month = pred_month_name
                    predicted_year = pred_year
                    break

        subject = " Daily Rubber AI Price Forecast"

        message = f"""
<strong>Daily AI Rubber Price Forecast</strong><br><br>

 Forecast Month: <strong>{predicted_month} {predicted_year}</strong><br>
 Predicted Price: <strong style="color:green;">Rs. {predicted_price}</strong><br><br>

This prediction is generated using AI time-series forecasting models.
"""

        send_email_to_all_users(db, subject, message)

    except Exception as e:
        logger.error(f" Daily email job failed: {e}")

    finally:
        db.close()

def start_scheduler():
    global scheduler_started

    if scheduler_started:
        logger.info("⚠ Scheduler already running")
        return

    print(" Starting Email Scheduler...")

    try:

        scheduler.add_job(
    daily_email_job,
    trigger="cron",
    hour=7,
    minute=30,
    # minute="*",
    id="daily_email_job",
    replace_existing=True
)


        scheduler.start()
        scheduler_started = True

        logger.info(" Email Scheduler Started Successfully")

    except Exception as e:
        logger.error(f" Scheduler start failed: {e}")
