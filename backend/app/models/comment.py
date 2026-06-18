from pydantic import BaseModel

class CommentCreate(BaseModel):
    clerk_id: str
    post_id: int
    comment_text: str