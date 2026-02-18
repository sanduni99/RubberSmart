from pydantic import BaseModel, EmailStr, Field

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str
    
    class ContactResponse(BaseModel):
        id: int
        name: str
        email: EmailStr
        message: str
        created_at: str

        class Config:
            from_attributes = True