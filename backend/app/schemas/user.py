from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., max_length=72)
    phone: Optional[str] = None
    district: Optional[str] = None
    preferred_language: str = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
