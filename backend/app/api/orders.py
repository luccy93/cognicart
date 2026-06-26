from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import joinedload
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductResponse
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("")
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conditions = [Order.user_id == current_user["user_id"]]
    if status:
        conditions.append(Order.status == status)

    total_q = await db.execute(
        select(func.count()).select_from(Order).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Order).where(*conditions)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    orders = result.unique().scalars().all()
    return {"items": orders, "total": total, "page": page, "page_size": page_size}


@router.get("/{order_id}")
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).options(joinedload(Order.items).joinedload(OrderItem.product))
        .where(Order.id == order_id)
    )
    order = result.unique().scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.post("", status_code=201)
async def create_order(
    shipping_address: str,
    payment_method: str = "stripe",
    coupon_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cart_result = await db.execute(
        select(Cart).where(Cart.user_id == current_user["user_id"])
        .options(joinedload(Cart.items).joinedload(CartItem.product))
    )
    cart = cart_result.unique().scalar_one_or_none()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_number = f"COG-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"
    subtotal = sum(item.product.price * item.quantity for item in cart.items)
    tax = subtotal * 0.08
    shipping_cost = 0 if subtotal > 50 else 9.99
    discount = 0
    total = subtotal + tax + shipping_cost - discount

    order = Order(
        id=uuid4(), order_number=order_number, user_id=current_user["user_id"],
        subtotal=subtotal, tax=tax, shipping_cost=shipping_cost,
        discount=discount, total=total, shipping_address=shipping_address,
        payment_method=payment_method
    )
    db.add(order)

    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id, product_id=cart_item.product_id,
            quantity=cart_item.quantity, price=cart_item.product.price,
            total_price=cart_item.product.price * cart_item.quantity
        )
        db.add(order_item)
        await db.execute(
            text("UPDATE products SET stock = stock - :qty WHERE id = :pid AND stock >= :qty"),
            {"qty": cart_item.quantity, "pid": cart_item.product_id}
        )

    # Clear cart
    for item in cart.items:
        await db.delete(item)
    await db.delete(cart)

    # Update user stats
    await db.execute(
        text("UPDATE users SET total_orders = total_orders + 1, total_spent = total_spent + :total WHERE id = :uid"),
        {"total": total, "uid": str(current_user["user_id"])}
    )

    await db.commit()
    return {"order_id": order.id, "order_number": order_number, "total": total}


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatus(status)
    if status == "delivered":
        order.delivered_at = datetime.now(timezone.utc)
        order.payment_status = PaymentStatus.COMPLETED
    await db.commit()
    return {"message": f"Order status updated to {status}"}
