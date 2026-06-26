from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.database import get_db
from app.models.interaction import Rating, UserInteraction, BrowsingHistory
from app.models.recommendation import Recommendation, RecommendationFeedback
from app.models.product import Product
from app.models.user import User
from app.auth.jwt import require_admin

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])


@router.get("/recommendation-stats")
async def recommendation_stats(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    total_recommendations = await db.scalar(select(func.count(Recommendation.id)))
    total_feedback = await db.scalar(select(func.count(RecommendationFeedback.id)))

    positive_feedback = 0
    if total_feedback:
        positive = await db.execute(
            select(func.count(RecommendationFeedback.id)).where(RecommendationFeedback.clicked == True)  # noqa: E712
        )
        positive_feedback = positive.scalar()

    total_interactions = await db.scalar(select(func.count(UserInteraction.id)))
    total_ratings = await db.scalar(select(func.count(Rating.id)))

    avg_rating = await db.scalar(select(func.avg(Rating.rating)))

    cold_start_users = await db.scalar(
        select(func.count(User.id)).where(User.total_purchases == 0)
    )
    total_users = await db.scalar(select(func.count(User.id)))

    cold_start_products = await db.scalar(
        select(func.count(Product.id)).where(Product.total_ratings == 0)
    )
    total_products = await db.scalar(select(func.count(Product.id)))

    return {
        "recommendations_served": total_recommendations or 0,
        "feedback_count": total_feedback or 0,
        "positive_feedback_rate": round((positive_feedback / total_feedback * 100) if total_feedback else 0, 2),
        "total_interactions": total_interactions or 0,
        "total_ratings": total_ratings or 0,
        "average_rating": round(float(avg_rating), 2) if avg_rating else 0,
        "cold_start_users": cold_start_users or 0,
        "cold_start_users_rate": round((cold_start_users / total_users * 100) if total_users else 0, 2),
        "cold_start_products": cold_start_products or 0,
        "cold_start_products_rate": round((cold_start_products / total_products * 100) if total_products else 0, 2),
        "total_users": total_users or 0,
        "total_products": total_products or 0,
    }


@router.get("/engine-performance")
async def engine_performance(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    from sqlalchemy import text

    result = await db.execute(
        text("""
            SELECT
                re.engine,
                COUNT(*) as count,
                AVG(re.score) as avg_score
            FROM recommendations re
            GROUP BY re.engine
        """)
    )
    rows = result.all()

    return {
        "engines": [
            {"name": row.engine, "count": row.count, "avg_score": round(float(row.avg_score), 3)}
            for row in rows
        ]
    }
