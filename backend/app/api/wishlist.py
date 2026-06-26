from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import joinedload
from uuid import UUID, uuid4

from app.database import get_db
from app.models.interaction import Wishlist, UserInteraction, InteractionType
from app.models.product import Product
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


@router.get("")
async def get_wishlist(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user["user_id"])
        .options(joinedload(Wishlist.product).joinedload(Product.images))
        .order_by(Wishlist.added_at.desc())
    )
    items = result.unique().scalars().all()

    return [{
        "id": str(item.id),
        "product_id": str(item.product_id),
        "product": {
            "id": str(item.product.id),
            "name": item.product.name,
            "price": item.product.price,
            "original_price": item.product.original_price,
            "thumbnail_url": item.product.thumbnail_url,
            "average_rating": item.product.average_rating,
            "stock": item.product.stock
        },
        "added_at": item.added_at.isoformat()
    } for item in items]


@router.post("/add/{product_id}")
async def add_to_wishlist(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user["user_id"],
            Wishlist.product_id == product_id
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already in wishlist"}

    item = Wishlist(user_id=current_user["user_id"], product_id=product_id)
    db.add(item)

    interaction = UserInteraction(
        user_id=current_user["user_id"], product_id=product_id,
        interaction_type=InteractionType.ADD_TO_WISHLIST
    )
    db.add(interaction)
    await db.commit()
    return {"message": "Added to wishlist"}


@router.delete("/remove/{product_id}")
async def remove_from_wishlist(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await db.execute(
        delete(Wishlist).where(
            Wishlist.user_id == current_user["user_id"],
            Wishlist.product_id == product_id
        )
    )
    await db.commit()
    return {"message": "Removed from wishlist"}
