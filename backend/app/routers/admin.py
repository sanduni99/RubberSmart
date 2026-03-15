from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.bulk_notification_service import send_email_to_all_users
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])


class EmailRequest(BaseModel):
    subject: str
    message: str


@router.post("/send-email")
def send_email(data: EmailRequest, db: Session = Depends(get_db)):

    try:
        result = send_email_to_all_users(
            db,
            data.subject,
            data.message
        )

        return {
            "message": "Emails sent",
            "stats": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))