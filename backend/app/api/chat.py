import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.jwt import get_current_user
from app.ai.chat_service import chat_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    type: str = "text"
    session_id: str
    products: list = []
    suggestions: list = []


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["user_id"])

    session_id = await chat_service.get_or_create_session(
        user_id, data.session_id or None, db
    )

    await chat_service.save_message(user_id, session_id, "user", data.message, db=db)

    try:
        response = await chat_service.generate_response(
            user_id, data.message, session_id, db
        )

        response_content = response.get("content", "")
        await chat_service.save_message(
            user_id, session_id, "assistant", response_content, db=db
        )

        return ChatResponse(
            response=response_content,
            type=response.get("type", "text"),
            session_id=session_id,
            products=response.get("products", []),
            suggestions=response.get("suggestions", []),
        )
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        return ChatResponse(
            response="I'm experiencing a temporary issue. Please try again or contact support.",
            type="text",
            session_id=session_id,
            suggestions=["Try again", "Contact support", "Browse products"],
        )
