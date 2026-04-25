from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/admin", tags=["Admin"])



@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "district": user.district,
            "language": user.preferred_language,
            "role": user.role
        }
        for user in users
    ]



@router.put("/users/{user_id}")
def update_user(user_id: int, data: dict, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = data.get("name", user.name)
    user.phone = data.get("phone", user.phone)
    user.district = data.get("district", user.district)

    db.commit()

    return {"message": "User updated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}

@router.put("/users/{user_id}/status")
def toggle_user_status(user_id:int, db:Session=Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    user.is_active = not user.is_active

    db.commit()

    return {"status": user.is_active}

@router.put("/users/{user_id}/role")
def change_role(user_id:int, role:str, db:Session=Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    user.role = role

    db.commit()

    return {"message":"Role updated"}