from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., max_length=72)
    phone: Optional[str] = None
    district: Optional[str] = None
    preferred_language: str = "en"
    role: Optional[str] = "farmer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    new_password: str    