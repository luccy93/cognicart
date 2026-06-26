from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, text
from sqlalchemy.orm import joinedload
from typing import Optional, List
from uuid import UUID

from app.database import get_db
from app.models.product import Product, Category, ProductImage
from app.models.interaction import Rating, Review, BrowsingHistory, UserInteraction, InteractionType
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    ProductSearchParams, CategoryCreate, CategoryResponse,
    RatingCreate, ReviewCreate, ReviewResponse
)
from app.auth.jwt import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = None,
    sort_by: str = "popularity",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    in_stock: Optional[bool] = None,
    min_rating: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).options(joinedload(Product.category), joinedload(Product.images))

    conditions = [Product.is_active == True]
    if q:
        conditions.append(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.description.ilike(f"%{q}%"),
                Product.brand.ilike(f"%{q}%"),
                Product.tags.ilike(f"%{q}%")
            )
        )
    if category_id:
        conditions.append(Product.category_id == category_id)
    if min_price is not None:
        conditions.append(Product.price >= min_price)
    if max_price is not None:
        conditions.append(Product.price <= max_price)
    if brand:
        conditions.append(Product.brand.ilike(f"%{brand}%"))
    if in_stock:
        conditions.append(Product.stock > 0)
    if min_rating is not None:
        conditions.append(Product.average_rating >= min_rating)

    query = query.where(*conditions)

    sort_map = {
        "popularity": Product.popularity_score,
        "price": Product.price,
        "rating": Product.average_rating,
        "newest": Product.created_at,
        "name": Product.name,
        "purchases": Product.total_purchases
    }
    sort_col = sort_map.get(sort_by, Product.popularity_score)
    query = query.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())

    total_query = select(func.count()).select_from(Product).where(*conditions)
    total_result = await db.execute(total_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    products = result.unique().scalars().all()

    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(joinedload(Product.category), joinedload(Product.images))
        .where(Product.id == product_id)
    )
    product = result.unique().scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    await db.commit()


# Categories
@router.get("/categories/all", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category).where(Category.is_active == True).order_by(Category.sort_order)
    )
    categories = result.scalars().all()
    # Attach product counts
    for cat in categories:
        count_result = await db.execute(
            select(func.count()).select_from(Product).where(
                Product.category_id == cat.id, Product.is_active == True
            )
        )
        cat.product_count = count_result.scalar()
    return categories


# Ratings
@router.post("/ratings", status_code=201)
async def create_rating(
    data: RatingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    rating = Rating(user_id=current_user["user_id"], product_id=data.product_id, rating=data.rating)
    db.add(rating)

    # Update product average rating
    stats = await db.execute(
        select(func.avg(Rating.rating), func.count(Rating.id))
        .where(Rating.product_id == data.product_id)
    )
    avg, count = stats.first()
    await db.execute(
        text("UPDATE products SET average_rating = :avg, total_ratings = :cnt WHERE id = :pid"),
        {"avg": round(float(avg), 2), "cnt": count, "pid": data.product_id}
    )
    await db.commit()
    return {"message": "Rating created"}


@router.get("/{product_id}/reviews", response_model=List[ReviewResponse])
async def get_reviews(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review).where(Review.product_id == product_id)
        .order_by(Review.created_at.desc()).limit(20)
    )
    reviews = result.scalars().all()
    response = []
    for r in reviews:
        user = await db.execute(select(User).where(User.id == r.user_id))
        u = user.scalar_one()
        response.append(ReviewResponse(
            id=r.id, user_id=r.user_id, user_name=u.full_name,
            user_avatar=u.avatar_url, title=r.title, content=r.content,
            rating=r.rating, is_verified_purchase=r.is_verified_purchase,
            helpful_count=r.helpful_count, created_at=r.created_at
        ))
    return response
