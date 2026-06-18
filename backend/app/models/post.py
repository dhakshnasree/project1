from pydantic import BaseModel
from typing import Optional

class Post(BaseModel):
    user_id: int
    title: str
    content: str
    lesson: Optional[str] = ""
    category: Optional[str] = "General"
    image_url: Optional[str] = None
    video_url: Optional[str] = None