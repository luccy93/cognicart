from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Optional
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # User stats
    user_result = await db.execute(
        text("""
            SELECT
                COUNT(*) as total_users,
                SUM(CASE WHEN created_at >= :since THEN 1 ELSE 0 END) as new_users
            FROM users WHERE role = 'customer'
        """),
        {"since": since}
    )
    user_stats = user_result.one()

    # Order stats
    order_result = await db.execute(
        text("""
            SELECT
                COUNT(*) as total_orders,
                COALESCE(SUM(total), 0) as total_revenue,
                COALESCE(AVG(total), 0) as avg_order_value,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
            FROM orders WHERE created_at >= :since
        """),
        {"since": since}
    )
    order_stats = order_result.one()

    # Revenue by day
    revenue_result = await db.execute(
        text("""
            SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as revenue
            FROM orders WHERE created_at >= :since AND status != 'cancelled'
            GROUP BY DATE(created_at) ORDER BY date
        """),
        {"since": since}
    )
    revenue_by_day = [{"date": str(row[0]), "revenue": float(row[1])} for row in revenue_result.fetchall()]

    # Product stats
    product_result = await db.execute(
        text("""
            SELECT COUNT(*) as total_products,
                   SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_products
            FROM products
        """)
    )
    product_stats = product_result.one()

    # Top categories
    cat_result = await db.execute(
        text("""
            SELECT c.name, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            GROUP BY c.name ORDER BY product_count DESC LIMIT 5
        """)
    )
    top_categories = [{"name": row[0], "count": row[1]} for row in cat_result.fetchall()]

    return {
        "users": {
            "total": user_stats.total_users,
            "new": user_stats.new_users
        },
        "orders": {
            "total": order_stats.total_orders,
            "revenue": float(order_stats.total_revenue),
            "avg_order_value": float(order_stats.avg_order_value),
            "completed": order_stats.completed_orders,
            "cancelled": order_stats.cancelled_orders
        },
        "products": {
            "total": product_stats.total_products,
            "active": product_stats.active_products
        },
        "revenue_by_day": revenue_by_day,
        "top_categories": top_categories,
        "period_days": days
    }


@router.get("/user-insights")
async def get_user_insights(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        text("""
            SELECT
                (SELECT COUNT(*) FROM orders WHERE user_id = :uid) as total_orders,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = :uid) as total_spent,
                (SELECT COUNT(*) FROM wishlists WHERE user_id = :uid) as wishlist_count,
                (SELECT COUNT(*) FROM browsing_history WHERE user_id = :uid) as products_viewed,
                (SELECT COUNT(*) FROM ratings WHERE user_id = :uid) as total_ratings,
                (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE user_id = :uid) as avg_rating
        """),
        {"uid": str(current_user["user_id"])}
    )
    stats = result.one()

    # Category preferences
    cat_result = await db.execute(
        text("""
            SELECT c.name, COUNT(*) as count
            FROM user_interactions ui
            JOIN products p ON ui.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE ui.user_id = :uid
            GROUP BY c.name ORDER BY count DESC LIMIT 5
        """),
        {"uid": str(current_user["user_id"])}
    )
    top_categories = [{"name": row[0], "count": row[1]} for row in cat_result.fetchall()]

    return {
        "total_orders": stats.total_orders,
        "total_spent": float(stats.total_spent or 0),
        "wishlist_count": stats.wishlist_count,
        "products_viewed": stats.products_viewed,
        "total_ratings": stats.total_ratings,
        "avg_rating": float(stats.avg_rating or 0),
        "top_categories": top_categories
    }
