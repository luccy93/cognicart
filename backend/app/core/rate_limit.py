import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from typing import Dict, Tuple


class InMemoryRateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)

    def is_limited(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - window_seconds
        self.requests[key] = [t for t in self.requests[key] if t > window_start]
        count = len(self.requests[key])
        if count >= max_requests:
            return True, max_requests - count
        self.requests[key].append(now)
        return False, max_requests - count - 1


rate_limiter = InMemoryRateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    path = request.url.path

    if path.startswith("/api/auth/login"):
        client_ip = request.client.host if request.client else "unknown"
        limited, remaining = rate_limiter.is_limited(f"login:{client_ip}", 5, 60)
        if limited:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many login attempts. Please try again later."}
            )
    elif path.startswith("/api/auth/register"):
        client_ip = request.client.host if request.client else "unknown"
        limited, remaining = rate_limiter.is_limited(f"register:{client_ip}", 3, 300)
        if limited:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many registration attempts. Please try again later."}
            )
    elif path.startswith("/api/auth/forgot-password") or path.startswith("/api/auth/resend-otp"):
        client_ip = request.client.host if request.client else "unknown"
        limited, remaining = rate_limiter.is_limited(f"password:{client_ip}", 3, 300)
        if limited:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."}
            )
    elif path.startswith("/api/"):
        client_ip = request.client.host if request.client else "unknown"
        limited, remaining = rate_limiter.is_limited(f"api:{client_ip}", 100, 60)
        if limited:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."}
            )

    response = await call_next(request)
    return response
