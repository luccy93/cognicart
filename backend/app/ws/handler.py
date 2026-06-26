import json
import logging
from fastapi import WebSocket, WebSocketDisconnect
from app.ws.manager import ws_manager
from app.auth.jwt import decode_token as decode_access_token
from app.database import AsyncSessionLocal as async_session_factory
from app.ai.chat_service import chat_service

logger = logging.getLogger(__name__)


async def handle_chat_event(ws: WebSocket, data: dict):
    """Handle chat_message events with AI response generation."""
    user_id = getattr(ws, "_user_id", None)
    if not user_id:
        await ws.send_json({"event": "error", "message": "Not authenticated"})
        return

    session_id = data.get("session_id", "")
    content = data.get("content", "").strip()
    if not content:
        await ws.send_json({"event": "error", "message": "Empty message"})
        return

    async with async_session_factory() as db:
        session_id = await chat_service.get_or_create_session(
            user_id, session_id or None, db
        )

        # Save user message
        await chat_service.save_message(user_id, session_id, "user", content, db=db)

        # Send typing indicator
        await ws.send_json({
            "event": "typing",
            "session_id": session_id,
            "status": True,
        })

        # Generate response
        try:
            response = await chat_service.generate_response(
                user_id, content, session_id, db
            )

            # Save AI response content to history
            response_content = response.get("content", "")
            await chat_service.save_message(
                user_id, session_id, "assistant", response_content, db=db
            )

            # Send response
            await ws.send_json({
                "event": "chat_response",
                "session_id": session_id,
                "data": response,
            })
        except Exception as e:
            logger.error(f"AI response generation error: {e}", exc_info=True)
            await ws.send_json({
                "event": "chat_response",
                "session_id": session_id,
                "data": {
                    "type": "text",
                    "content": "I'm experiencing a temporary issue. Please try again or contact support.",
                    "suggestions": ["Try again", "Contact support", "Browse products"],
                },
            })
        finally:
            await ws.send_json({
                "event": "typing",
                "session_id": session_id,
                "status": False,
            })


async def handle_websocket(ws: WebSocket, token: str = None):
    user_id = None
    try:
        if token:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
        if not user_id:
            await ws.accept()
            await ws.send_json({"event": "error", "message": "Authentication required"})
            await ws.close()
            return

        await ws_manager.connect(user_id, ws)
        ws._user_id = user_id
        await ws.send_json({"event": "connected", "user_id": user_id, "stats": ws_manager.stats})

        # Register chat handler
        ws_manager.register_handler("chat_message", handle_chat_event)

        while True:
            raw = await ws.receive_text()
            await ws_manager.handle_message(user_id, ws, raw)

    except WebSocketDisconnect:
        if user_id:
            ws_manager.disconnect(user_id, ws)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if user_id:
            ws_manager.disconnect(user_id, ws)
