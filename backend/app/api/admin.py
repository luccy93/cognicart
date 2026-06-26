from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import joinedload
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.product import ProductResponse, ProductUpdate, ProductCreate, CategoryCreate, CategoryResponse
from app.auth.jwt import require_admin, require_super_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    conditions = []
    if role:
        conditions.append(User.role == UserRole(role))
    if search:
        from sqlalchemy import or_
        conditions.append(
            or_(User.full_name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%"))
        )

    total_q = await db.execute(
        select(func.count()).select_from(User).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(User).where(*conditions)
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    users = result.scalars().all()

    return {
        "items": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: UUID,
    role: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_super_admin)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = UserRole(role)
    await db.commit()
    return {"message": f"User role updated to {role}"}


@router.put("/users/{user_id}/status")
async def toggle_user_status(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


@router.get("/products", response_model=dict)
async def admin_list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    total_q = await db.execute(select(func.count()).select_from(Product))
    total = total_q.scalar()

    result = await db.execute(
        select(Product).options(joinedload(Product.category), joinedload(Product.images))
        .order_by(Product.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    products = result.unique().scalars().all()

    return {
        "items": [ProductResponse.model_validate(p) for p in products],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/orders")
async def admin_list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    conditions = []
    if status:
        conditions.append(Order.status == OrderStatus(status))

    total_q = await db.execute(
        select(func.count()).select_from(Order).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Order).options(joinedload(Order.items).joinedload(OrderItem.product))
        .where(*conditions).order_by(Order.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    orders = result.unique().scalars().all()

    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/analytics/overview")
async def admin_analytics_overview(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(
        text("""
            SELECT
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM products) as total_products,
                (SELECT COUNT(*) FROM orders) as total_orders,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
                (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
                (SELECT COUNT(*) FROM orders WHERE created_at >= datetime('now', '-1 day')) as orders_last_24h
        """)
    )
    stats = result.one()

    # Revenue by month
    monthly = await db.execute(
        text("""
            SELECT strftime('%Y-%m-01', created_at) as month,
                   COALESCE(SUM(total), 0) as revenue
            FROM orders WHERE status != 'cancelled'
            GROUP BY month ORDER BY month DESC LIMIT 12
        """)
    )
    monthly_revenue = [{"month": str(row[0]), "revenue": float(row[1])} for row in monthly.fetchall()]

    # Top selling products
    top_products = await db.execute(
        text("""
            SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as total_revenue
            FROM order_items oi JOIN products p ON oi.product_id = p.id
            GROUP BY p.name ORDER BY total_sold DESC LIMIT 10
        """)
    )

    return {
        "overview": {
            "total_users": stats.total_users,
            "total_products": stats.total_products,
            "total_orders": stats.total_orders,
            "total_revenue": float(stats.total_revenue),
            "pending_orders": stats.pending_orders,
            "orders_last_24h": stats.orders_last_24h
        },
        "monthly_revenue": monthly_revenue,
        "top_products": [{"name": r[0], "sold": r[1], "revenue": float(r[2])} for r in top_products.fetchall()]
    }
