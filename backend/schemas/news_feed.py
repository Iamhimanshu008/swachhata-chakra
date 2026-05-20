from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NewsFeedCreate(BaseModel):
    title: str
    summary: str
    emoji: str = "📰"
    tag: str = "Update"
    tag_color: str = "#16a34a"
    is_published: bool = True

class NewsFeedUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    emoji: Optional[str] = None
    tag: Optional[str] = None
    tag_color: Optional[str] = None
    is_published: Optional[bool] = None

class NewsFeedRead(BaseModel):
    id: int
    title: str
    summary: str
    emoji: str
    tag: str
    tag_color: str
    is_published: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
