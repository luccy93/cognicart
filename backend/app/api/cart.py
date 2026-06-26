from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import joinedload
from uuid import UUID, uuid4

from app.database import get_db
from app.models.order import Cart, CartItem
from app.models.product import Product
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])


@router.get("")
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Cart).where(Cart.user_id == current_user["user_id"])
        .options(joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.images))
    )
    cart = result.unique().scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=current_user["user_id"])
        db.add(cart)
        await db.commit()

    items = []
    total = 0
    for item in cart.items:
        items.append({
            "id": str(item.id),
            "product_id": str(item.product_id),
            "product": {
                "id": str(item.product.id),
                "name": item.product.name,
                "price": item.product.price,
                "thumbnail_url": item.product.thumbnail_url,
                "stock": item.product.stock
            },
            "quantity": item.quantity,
            "total_price": item.product.price * item.quantity
        })
        total += item.product.price * item.quantity

    return {"items": items, "total": total, "item_count": len(items)}


@router.post("/add")
async def add_to_cart(
    product_id: UUID,
    quantity: int = 1,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    product = await db.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    result = await db.execute(
        select(Cart).where(Cart.user_id == current_user["user_id"])
    )
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=current_user["user_id"])
        db.add(cart)
        await db.flush()

    existing = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
            CartItem.user_id == current_user["user_id"]
        )
    )
    cart_item = existing.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id, user_id=current_user["user_id"],
            product_id=product_id, quantity=quantity
        )
        db.add(cart_item)

    # Log interaction
    from app.models.interaction import UserInteraction, InteractionType
    interaction = UserInteraction(
        user_id=current_user["user_id"], product_id=product_id,
        interaction_type=InteractionType.ADD_TO_CART
    )
    db.add(interaction)

    await db.commit()
    return {"message": "Added to cart", "quantity": cart_item.quantity}


@router.put("/update/{item_id}")
async def update_cart_item(
    item_id: UUID,
    quantity: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    result = await db.execute(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user["user_id"]
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    item.quantity = quantity
    await db.commit()
    return {"message": "Cart updated"}


@router.delete("/remove/{item_id}")
async def remove_from_cart(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user["user_id"]
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(item)
    await db.commit()
    return {"message": "Removed from cart"}


@router.delete("")
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Cart).where(Cart.user_id == current_user["user_id"])
    )
    cart = result.scalar_one_or_none()
    if cart:
        await db.execute(
            delete(CartItem).where(CartItem.cart_id == cart.id)
        )
        await db.commit()
    return {"message": "Cart cleared"}
