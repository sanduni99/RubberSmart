from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas.user import UserSignup, UserLogin
from app.schemas.user import ForgotPassword, ResetPassword
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.services.email_service import send_email_notification
from app.schemas.user import UpdateUser

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        district=user.district,
        preferred_language=user.preferred_language,
        password_hash=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
            "district": new_user.district,
            "preferred_language": new_user.preferred_language
        }
    }

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})
    return {
    "access_token": token,
    "token_type": "bearer",
    "user": {
        "name": db_user.name,
        "email": db_user.email,
        "phone": db_user.phone,
        "district": db_user.district,
        "preferred_language": db_user.preferred_language,
        "role": db_user.role
    }
}
    
@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    
    db_user = db.query(User).filter(User.email == data.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

 
    reset_token = create_access_token({"sub": db_user.email})

    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"

    subject = "Reset Your RubberSmart Password"

    message = f"""
You requested a password reset.<br><br>

Click the link below to reset your password:<br><br>

<a href="{reset_link}">{reset_link}</a><br><br>

If you did not request this, please ignore this email.
"""

  
    email_sent = send_email_notification(
        db_user.email,
        subject,
        message
    )

    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"message": "Password reset email sent"}

@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == data.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.password_hash = hash_password(data.new_password)

    db.commit()

    return {"message": "Password reset successful"}


@router.put("/update-profile")
def update_profile(data: UpdateUser, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.current_email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(User).filter(User.email == data.new_email).first()

    if existing and existing.id != user.id:
        raise HTTPException(status_code=400, detail="Email already in use")

    user.name = data.name
    user.email = data.new_email
    user.phone = data.phone
    user.district = data.district
    user.preferred_language = data.preferred_language

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "district": user.district,
            "preferred_language": user.preferred_language
        }
    }