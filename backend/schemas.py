from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Shared Activity Properties
class ActivityBase(BaseModel):
    topic: str
    title: str
    status: str

# Properties to create an activity
class ActivityCreate(ActivityBase):
    pass

# Activity returned to client
class Activity(ActivityBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Shared User Properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

# Properties to create a user
class UserCreate(UserBase):
    password: str

# User returned to client
class User(UserBase):
    id: int
    created_at: datetime
    activities: List[Activity] = []

    class Config:
        from_attributes = True

# JWT Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Custom Plan Response
class PlanResponse(BaseModel):
    plan_markdown: str
