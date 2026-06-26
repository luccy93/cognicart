from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, and_
from sqlalchemy.orm import joinedload
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.interaction import Review
from app.models.enterprise import ReviewImage, ReviewVote, ReviewVoteType
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.enterprise import (
    ReviewCreate, ReviewUpdate, ReviewResponse,
    ReviewModeration
)
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("/products/{product_id}")
async def list_product_reviews(
    product_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = "newest",
    db: AsyncSession = Depends(get_db)
):
    conditions = [Review.product_id == product_id]

    sort_map = {
        "newest": Review.created_at.desc(),
        "oldest": Review.created_at.asc(),
        "highest": Review.rating.desc(),
        "lowest": Review.rating.asc(),
        "helpful": Review.helpful_count.desc()
    }
    order = sort_map.get(sort_by, Review.created_at.desc())

    total_q = await db.execute(
        select(func.count()).select_from(Review).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Review).where(*conditions)
        .order_by(order)
        .offset((page - 1) * page_size).limit(page_size)
    )
    reviews = result.scalars().all()

    items = []
    for r in reviews:
        user = await db.get(User, r.user_id)
        images_result = await db.execute(
            select(ReviewImage).where(ReviewImage.review_id == r.id)
        )
        images = [img.url for img in images_result.scalars().all()]

        items.append(ReviewResponse(
            id=r.id, user_id=r.user_id,
            user_name=user.full_name if user else "Unknown",
            user_avatar=user.avatar_url if user else None,
            product_id=r.product_id,
            title=r.title, content=r.content,
            rating=r.rating,
            is_verified_purchase=r.is_verified_purchase,
            helpful_count=r.helpful_count,
            images=images,
            created_at=r.created_at, updated_at=r.updated_at
        ))

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check if user has purchased the product
    order_result = await db.execute(
        select(OrderItem).join(Order).where(
            Order.user_id == current_user["user_id"],
            OrderItem.product_id == data.product_id,
            Order.status == "delivered"
        ).limit(1)
    )
    purchased = order_result.scalar_one_or_none() is not None

    existing = await db.execute(
        select(Review).where(
            Review.user_id == current_user["user_id"],
            Review.product_id == data.product_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    review = Review(
        id=uuid4(),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        title=data.title,
        content=data.content,
        rating=data.rating,
        is_verified_purchase=purchased
    )
    db.add(review)
    await db.flush()

    if data.images:
        for url in data.images:
            img = ReviewImage(review_id=review.id, url=url)
            db.add(img)

    await db.commit()
    await db.refresh(review)

    user = await db.get(User, current_user["user_id"])
    images_result = await db.execute(
        select(ReviewImage).where(ReviewImage.review_id == review.id)
    )
    images = [img.url for img in images_result.scalars().all()]

    return ReviewResponse(
        id=review.id, user_id=review.user_id,
        user_name=user.full_name if user else "Unknown",
        user_avatar=user.avatar_url if user else None,
        product_id=review.product_id,
        title=review.title, content=review.content,
        rating=review.rating,
        is_verified_purchase=review.is_verified_purchase,
        helpful_count=review.helpful_count,
        images=images,
        created_at=review.created_at, updated_at=review.updated_at
    )


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: UUID,
    data: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(review, key, value)
    review.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(review)

    user = await db.get(User, current_user["user_id"])
    images_result = await db.execute(
        select(ReviewImage).where(ReviewImage.review_id == review.id)
    )
    images = [img.url for img in images_result.scalars().all()]

    return ReviewResponse(
        id=review.id, user_id=review.user_id,
        user_name=user.full_name if user else "Unknown",
        user_avatar=user.avatar_url if user else None,
        product_id=review.product_id,
        title=review.title, content=review.content,
        rating=review.rating,
        is_verified_purchase=review.is_verified_purchase,
        helpful_count=review.helpful_count,
        images=images,
        created_at=review.created_at, updated_at=review.updated_at
    )


@router.delete("/{review_id}", status_code=204)
async def delete_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    await db.delete(review)
    await db.commit()


@router.post("/{review_id}/vote")
async def vote_review(
    review_id: UUID,
    vote_type: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    existing = await db.execute(
        select(ReviewVote).where(
            ReviewVote.review_id == review_id,
            ReviewVote.user_id == current_user["user_id"]
        )
    )
    existing_vote = existing.scalar_one_or_none()

    if existing_vote:
        if existing_vote.vote_type.value == vote_type:
            await db.delete(existing_vote)
            review.helpful_count = max(0, review.helpful_count - (1 if vote_type == "helpful" else 0))
            await db.commit()
            return {"message": "Vote removed", "helpful_count": review.helpful_count}
        existing_vote.vote_type = ReviewVoteType(vote_type)
    else:
        vote = ReviewVote(
            id=uuid4(),
            review_id=review_id,
            user_id=current_user["user_id"],
            vote_type=ReviewVoteType(vote_type)
        )
        db.add(vote)
        if vote_type == "helpful":
            review.helpful_count += 1

    await db.commit()
    return {"message": f"Marked as {vote_type}", "helpful_count": review.helpful_count}


@router.get("/pending-moderation")
async def list_pending_reviews(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(
        select(Review).where(Review.is_verified_purchase == False)
        .order_by(Review.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{review_id}/moderate", response_model=dict)
async def moderate_review(
    review_id: UUID,
    data: ReviewModeration,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if not data.is_approved:
        await db.delete(review)
        await db.commit()
        return {"message": "Review rejected and deleted"}

    review.is_verified_purchase = True
    await db.commit()
    return {"message": "Review approved"}
