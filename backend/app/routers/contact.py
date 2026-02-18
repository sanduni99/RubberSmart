import smtplib
from email.mime.text import MIMEText
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ContactMessage
from app.schemas.contact import ContactMessageCreate




router = APIRouter()
@router.post("/contact")
def create_contact_message(
    contact_message: ContactMessageCreate,
    db: Session = Depends(get_db)
):

    # Save to DB
    new_message = ContactMessage(
        name=contact_message.name,
        email=contact_message.email,
        message=contact_message.message
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Send Email
    try:
        msg = MIMEText(
            f"New Contact Message\n\n"
            f"Name: {contact_message.name}\n"
            f"Email: {contact_message.email}\n"
            f"Message:\n{contact_message.message}"
        )

        msg["Subject"] = "New Contact Message - RubberSmart"
        msg["From"] = "your_email@gmail.com"
        msg["To"] = "your_email@gmail.com"

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login("your_email@gmail.com", "your_app_password")
        server.send_message(msg)
        server.quit()

        print("EMAIL SENT SUCCESS")

    except Exception as e:
        print("EMAIL ERROR:", e)

    return {"message": "Contact message saved and email sent"}
