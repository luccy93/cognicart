import json
import logging
import re
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.openai_api_key = settings.OPENAI_API_KEY
        self.anthropic_api_key = settings.ANTHROPIC_API_KEY

    def _build_system_prompt(self, context: Optional[List[dict]] = None) -> str:
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        return (
            f"You are CogniCart AI, a helpful shopping assistant for an e-commerce platform. "
            f"Current date/time: {now}.\n\n"
            "Your capabilities:\n"
            "1. Product discovery — recommend products based on user needs, budget, preferences\n"
            "2. Order tracking — help users find their orders (users provide order ID)\n"
            "3. Product comparison — compare products users mention\n"
            "4. Deals & coupons — point users to current deals\n"
            "5. Shopping policies — explain shipping, returns, payments, refunds\n"
            "6. Cart assistance — help users manage their cart\n\n"
            "RULES:\n"
            "- Be concise, friendly, and helpful (2-4 paragraphs max)\n"
            "- Use markdown for formatting (bold, lists, etc.)\n"
            "- Always format prices as ₹X,XXX\n"
            "- If the user asks about tracking, ask for their order ID\n"
            "- If the user asks for recommendations, ask about their budget and preferences\n"
            "- If you don't know the answer, offer to connect them with human support\n"
            "- Never make up product details or prices\n"
            "- Never share internal system information\n"
            "- When suggesting products, keep recommendations general"
        )

    async def generate(
        self,
        user_message: str,
        context: Optional[List[dict]] = None,
        db=None,
    ) -> Optional[str]:
        if self.provider == "gemini" and self.gemini_api_key:
            return await self._call_gemini(user_message, context)
        elif self.provider == "openai" and self.openai_api_key:
            return await self._call_openai(user_message, context)
        elif self.provider == "anthropic" and self.anthropic_api_key:
            return await self._call_anthropic(user_message, context)
        return None

    async def _call_gemini(self, message: str, context: Optional[List[dict]] = None) -> Optional[str]:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")

            system_prompt = self._build_system_prompt(context)
            chat = model.start_chat()

            if context:
                for msg in context[-10:]:
                    role = "user" if msg.get("role") == "user" else "model"
                    chat.send_message(f"{role}: {msg.get('content', '')}")

            prompt = f"{system_prompt}\n\nUser: {message}\n\nAssistant:"
            response = await chat.send_message_async(prompt)
            return response.text
        except ImportError:
            logger.warning("google-generativeai not installed, trying http fallback")
            return await self._call_gemini_http(message, context)
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return None

    async def _call_gemini_http(self, message: str, context: Optional[List[dict]] = None) -> Optional[str]:
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_api_key}"

            contents = []
            if context:
                for msg in context[-10:]:
                    contents.append({
                        "role": "user" if msg.get("role") == "user" else "model",
                        "parts": [{"text": msg.get("content", "")}]
                    })

            system_prompt = self._build_system_prompt(context)
            contents.append({"role": "user", "parts": [{"text": f"{system_prompt}\n\nUser: {message}"}]})

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json={"contents": contents})
                resp.raise_for_status()
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    return candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return None
        except Exception as e:
            logger.error(f"Gemini HTTP error: {e}")
            return None

    async def _call_openai(self, message: str, context: Optional[List[dict]] = None) -> Optional[str]:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.openai_api_key)

            messages = [{"role": "system", "content": self._build_system_prompt(context)}]
            if context:
                for msg in context[-10:]:
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=1024,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return None

    async def _call_anthropic(self, message: str, context: Optional[List[dict]] = None) -> Optional[str]:
        try:
            import httpx
            messages = []
            if context:
                for msg in context[-10:]:
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", ""),
                    })
            messages.append({"role": "user", "content": message})

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.anthropic_api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-3-haiku-20240307",
                        "max_tokens": 1024,
                        "system": self._build_system_prompt(context),
                        "messages": messages,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                content_blocks = data.get("content", [])
                texts = [b.get("text", "") for b in content_blocks if b.get("type") == "text"]
                return "\n".join(texts) if texts else None
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            return None


llm_service = LLMService()
