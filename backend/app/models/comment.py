from pydantic import BaseModel

class Comment(BaseModel):
    user_id: int
    post_id: int
    content: str