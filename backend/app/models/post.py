from pydantic import BaseModel
from typing import Optional

class Post(BaseModel):
    user_id: int
    title: str
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
