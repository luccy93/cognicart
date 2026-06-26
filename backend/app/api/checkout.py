from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import joinedload
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod, Cart, CartItem
from app.models.product import Product
from app.models.additional import Address, Coupon
from app.models.enterprise import OrderTimeline
from app.schemas.enterprise import CheckoutRequest, CheckoutResponse
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/checkout", tags=["Checkout"])


@router.post("", response_model=CheckoutResponse)
async def process_checkout(
    data: CheckoutRequest,
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

    address = await db.get(Address, data.address_id)
    if not address or address.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Address not found")

    order_number = f"COG-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"
    subtotal = sum(item.product.price * item.quantity for item in cart.items)
    tax = subtotal * 0.08
    shipping_cost = 0 if subtotal > 50 else 9.99
    discount = 0

    if data.coupon_code:
        coupon_result = await db.execute(
            select(Coupon).where(Coupon.code == data.coupon_code, Coupon.is_active == True)
        )
        coupon = coupon_result.scalar_one_or_none()
        if not coupon:
            raise HTTPException(status_code=400, detail="Invalid coupon code")
        if subtotal < coupon.min_order_value:
            raise HTTPException(status_code=400, detail=f"Minimum order value of {coupon.min_order_value} required")
        if coupon.discount_type == "percentage":
            discount = subtotal * coupon.discount_value / 100
            if coupon.max_discount:
                discount = min(discount, coupon.max_discount)
        else:
            discount = coupon.discount_value
        coupon.used_count += 1

    total = subtotal + tax + shipping_cost - discount

    order = Order(
        id=uuid4(),
        order_number=order_number,
        user_id=current_user["user_id"],
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        discount=discount,
        coupon_code=data.coupon_code,
        total=total,
        shipping_address=f"{address.street}, {address.city}, {address.state} {address.postal_code}",
        shipping_city=address.city,
        shipping_country=address.country,
        shipping_postal_code=address.postal_code,
        payment_method=PaymentMethod(data.payment_method) if data.payment_method in ("stripe", "razorpay", "cod") else PaymentMethod.COD
    )
    db.add(order)

    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price,
            total_price=cart_item.product.price * cart_item.quantity
        )
        db.add(order_item)
        await db.execute(
            text("UPDATE products SET stock = stock - :qty WHERE id = :pid AND stock >= :qty"),
            {"qty": cart_item.quantity, "pid": cart_item.product_id}
        )

    for item in cart.items:
        await db.delete(item)
    await db.delete(cart)

    # Order timeline
    timeline = OrderTimeline(
        id=uuid4(),
        order_id=order.id,
        status="pending",
        note="Order placed successfully",
        created_by="system"
    )
    db.add(timeline)

    await db.execute(
        text("UPDATE users SET total_orders = total_orders + 1, total_spent = total_spent + :total WHERE id = :uid"),
        {"total": total, "uid": str(current_user["user_id"])}
    )

    await db.commit()

    payment_url = None
    if data.payment_method == "stripe":
        payment_url = f"/api/payments/stripe/checkout/{order.id}"

    return CheckoutResponse(
        order_id=order.id,
        order_number=order_number,
        total=total,
        payment_url=payment_url,
        status="pending"
    )


@router.post("/validate-coupon")
async def validate_coupon(
    code: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Coupon).where(Coupon.code == code, Coupon.is_active == True)
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found or expired")

    cart_result = await db.execute(
        select(Cart).where(Cart.user_id == current_user["user_id"])
        .options(joinedload(Cart.items).joinedload(CartItem.product))
    )
    cart = cart_result.unique().scalar_one_or_none()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = sum(item.product.price * item.quantity for item in cart.items)

    if subtotal < coupon.min_order_value:
        return {
            "valid": False,
            "discount": 0,
            "message": f"Minimum order value of {coupon.min_order_value} required"
        }

    if coupon.used_count >= coupon.usage_limit:
        return {"valid": False, "discount": 0, "message": "Coupon usage limit reached"}

    if coupon.discount_type == "percentage":
        discount = subtotal * coupon.discount_value / 100
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = coupon.discount_value

    return {
        "valid": True,
        "discount": round(discount, 2),
        "message": f"Coupon applied! You save {discount:.2f}"
    }
