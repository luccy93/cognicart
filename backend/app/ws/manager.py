import json
import asyncio
from typing import Dict, Set, Callable, Awaitable
from fastapi import WebSocket
from datetime import datetime, timezone


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}
        self.connections: Dict[str, WebSocket] = {}
        self.handlers: Dict[str, Callable[[WebSocket, dict], Awaitable[None]]] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        if user_id not in self.active:
            self.active[user_id] = set()
        self.active[user_id].add(ws)
        self.connections[id(ws)] = ws

    def disconnect(self, user_id: str, ws: WebSocket):
        if user_id in self.active:
            self.active[user_id].discard(ws)
            if not self.active[user_id]:
                del self.active[user_id]
        self.connections.pop(id(ws), None)

    async def send_personal_message(self, user_id: str, message: dict):
        if user_id in self.active:
            dead = set()
            for ws in self.active[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.active[user_id].discard(ws)

    async def broadcast(self, message: dict, role_filter: str = None):
        dead = set()
        for uid, sockets in self.active.items():
            for ws in sockets:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
        for ws in dead:
            for uid in list(self.active.keys()):
                self.active[uid].discard(ws)
                if not self.active[uid]:
                    del self.active[uid]

    def register_handler(self, event_type: str, handler: Callable[[WebSocket, dict], Awaitable[None]]):
        self.handlers[event_type] = handler

    async def handle_message(self, user_id: str, ws: WebSocket, raw: str):
        try:
            data = json.loads(raw)
            event = data.get("event", "ping")
            if event in self.handlers:
                await self.handlers[event](ws, data)
            elif event == "ping":
                await ws.send_json({"event": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
            else:
                await ws.send_json({"event": "error", "message": f"Unknown event: {event}"})
        except json.JSONDecodeError:
            await ws.send_json({"event": "error", "message": "Invalid JSON"})

    async def send_notification(self, user_id: str, notification: dict):
        msg = {"event": "notification", "data": notification}
        await self.send_personal_message(user_id, msg)

    async def send_recommendation_update(self, user_id: str, recommendations: list):
        msg = {"event": "recommendations_updated", "data": {"items": recommendations}}
        await self.send_personal_message(user_id, msg)

    @property
    def stats(self) -> dict:
        return {
            "total_users": len(self.active),
            "total_connections": len(self.connections),
            "users": list(self.active.keys()),
        }


ws_manager = ConnectionManager()
