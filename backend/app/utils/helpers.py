import re
import uuid
from typing import Optional
from datetime import datetime, timezone


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def generate_order_number() -> str:
    ts = datetime.now(timezone.utc).strftime('%Y%m%d')
    uid = uuid.uuid4().hex[:8].upper()
    return f"COG-{ts}-{uid}"


def generate_sku(name: str, category: Optional[str] = None) -> str:
    prefix = (category[:3] if category else 'GEN').upper()
    name_part = ''.join(word[:2] for word in name.split()[:2]).upper()
    uid = uuid.uuid4().hex[:4].upper()
    return f"{prefix}-{name_part}-{uid}"


def calculate_tier(points: int) -> str:
    if points >= 5000:
        return "Platinum"
    elif points >= 2500:
        return "Gold"
    elif points >= 1000:
        return "Silver"
    else:
        return "Bronze"


def calculate_level_progress(points: int) -> int:
    thresholds = [0, 1000, 2500, 5000, 10000]
    for i, t in enumerate(thresholds):
        if points < t:
            prev = thresholds[i - 1] if i > 0 else 0
            return int((points - prev) / (t - prev) * 100) if t > prev else 100
    return 100


def pagination_meta(total: int, page: int, page_size: int) -> dict:
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "has_next": page * page_size < total,
        "has_prev": page > 1
    }
