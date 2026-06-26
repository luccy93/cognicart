from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, or_
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.enterprise import (
    CommunityDiscussion, CommunityReply
)
from app.models.feature_extensions import ProductShare, CommunityRecommendation
from app.models.user import User
from app.models.product import Product
from app.schemas.enterprise import (
    DiscussionCreate, DiscussionResponse,
    ReplyCreate, ReplyResponse, ShareRequest
)
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/community", tags=["Community"])


@router.get("/discussions", response_model=dict)
async def list_discussions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: Optional[UUID] = None,
    tag: Optional[str] = None,
    sort_by: str = "newest",
    db: AsyncSession = Depends(get_db)
):
    conditions = [CommunityDiscussion.is_active == True]
    if product_id:
        conditions.append(CommunityDiscussion.product_id == product_id)
    if tag:
        conditions.append(CommunityDiscussion.tags.contains(tag))

    sort_map = {
        "newest": CommunityDiscussion.created_at.desc(),
        "popular": CommunityDiscussion.like_count.desc()
    }
    order = sort_map.get(sort_by, CommunityDiscussion.created_at.desc())

    total_q = await db.execute(
        select(func.count()).select_from(CommunityDiscussion).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(CommunityDiscussion).where(*conditions)
        .order_by(CommunityDiscussion.is_pinned.desc(), order)
        .offset((page - 1) * page_size).limit(page_size)
    )
    discussions = result.scalars().all()

    items = []
    for d in discussions:
        user = await db.get(User, d.user_id)
        items.append(DiscussionResponse(
            id=d.id, user_id=d.user_id,
            user_name=user.full_name if user else "Unknown",
            user_avatar=user.avatar_url if user else None,
            product_id=d.product_id,
            title=d.title, content=d.content,
            tags=d.tags, like_count=d.like_count,
            reply_count=d.reply_count, is_pinned=d.is_pinned,
            created_at=d.created_at
        ))

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/discussions", response_model=DiscussionResponse, status_code=201)
async def create_discussion(
    data: DiscussionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    discussion = CommunityDiscussion(
        id=uuid4(),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        title=data.title,
        content=data.content,
        tags=data.tags
    )
    db.add(discussion)
    await db.commit()
    await db.refresh(discussion)

    user = await db.get(User, current_user["user_id"])
    return DiscussionResponse(
        id=discussion.id, user_id=discussion.user_id,
        user_name=user.full_name if user else "Unknown",
        user_avatar=user.avatar_url if user else None,
        product_id=discussion.product_id,
        title=discussion.title, content=discussion.content,
        tags=discussion.tags, like_count=discussion.like_count,
        reply_count=discussion.reply_count, is_pinned=discussion.is_pinned,
        created_at=discussion.created_at
    )


@router.get("/discussions/{discussion_id}")
async def get_discussion(
    discussion_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CommunityDiscussion).where(CommunityDiscussion.id == discussion_id)
    )
    discussion = result.scalar_one_or_none()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")

    user = await db.get(User, discussion.user_id)
    discussion_data = DiscussionResponse(
        id=discussion.id, user_id=discussion.user_id,
        user_name=user.full_name if user else "Unknown",
        user_avatar=user.avatar_url if user else None,
        product_id=discussion.product_id,
        title=discussion.title, content=discussion.content,
        tags=discussion.tags, like_count=discussion.like_count,
        reply_count=discussion.reply_count, is_pinned=discussion.is_pinned,
        created_at=discussion.created_at
    )

    replies_result = await db.execute(
        select(CommunityReply).where(CommunityReply.discussion_id == discussion_id)
        .order_by(CommunityReply.created_at.asc())
    )
    replies = replies_result.scalars().all()
    reply_data = []
    for r in replies:
        reply_user = await db.get(User, r.user_id)
        reply_data.append(ReplyResponse(
            id=r.id, user_id=r.user_id,
            user_name=reply_user.full_name if reply_user else "Unknown",
            user_avatar=reply_user.avatar_url if reply_user else None,
            content=r.content, like_count=r.like_count,
            created_at=r.created_at
        ))

    return {"discussion": discussion_data, "replies": reply_data}


@router.put("/discussions/{discussion_id}", response_model=DiscussionResponse)
async def update_discussion(
    discussion_id: UUID,
    data: DiscussionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(CommunityDiscussion).where(CommunityDiscussion.id == discussion_id)
    )
    discussion = result.scalar_one_or_none()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    if discussion.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(discussion, key, value)
    discussion.updated_at = datetime.now(timezone.utc)
    await db.commit()

    user = await db.get(User, discussion.user_id)
    return DiscussionResponse(
        id=discussion.id, user_id=discussion.user_id,
        user_name=user.full_name if user else "Unknown",
        user_avatar=user.avatar_url if user else None,
        product_id=discussion.product_id,
        title=discussion.title, content=discussion.content,
        tags=discussion.tags, like_count=discussion.like_count,
        reply_count=discussion.reply_count, is_pinned=discussion.is_pinned,
        created_at=discussion.created_at
    )


@router.delete("/discussions/{discussion_id}", status_code=204)
async def delete_discussion(
    discussion_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(CommunityDiscussion).where(CommunityDiscussion.id == discussion_id)
    )
    discussion = result.scalar_one_or_none()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    if discussion.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    discussion.is_active = False
    await db.commit()


@router.post("/discussions/{discussion_id}/replies", response_model=ReplyResponse, status_code=201)
async def add_reply(
    discussion_id: UUID,
    data: ReplyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    discussion = await db.get(CommunityDiscussion, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")

    reply = CommunityReply(
        id=uuid4(),
        discussion_id=discussion_id,
        user_id=current_user["user_id"],
        content=data.content
    )
    db.add(reply)
    discussion.reply_count += 1
    await db.commit()
    await db.refresh(reply)

    user = await db.get(User, current_user["user_id"])
    return ReplyResponse(
        id=reply.id, user_id=reply.user_id,
        user_name=user.full_name if user else "Unknown",
        user_avatar=user.avatar_url if user else None,
        content=reply.content, like_count=reply.like_count,
        created_at=reply.created_at
    )


@router.put("/replies/{reply_id}", response_model=ReplyResponse)
async def update_reply(
    reply_id: UUID,
    data: ReplyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(CommunityReply).where(CommunityReply.id == reply_id)
    )
    reply = result.scalar_one_or_none()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    if reply.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    reply.content = data.content
    await db.commit()

    user = await db.get(User, reply.user_id)
    return ReplyResponse(
        id=reply.id, user_id=reply.user_id,
        user_name=user.full_name if user else "Unknown",
        user_avatar=user.avatar_url if user else None,
        content=reply.content, like_count=reply.like_count,
        created_at=reply.created_at
    )


@router.delete("/replies/{reply_id}", status_code=204)
async def delete_reply(
    reply_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(CommunityReply).where(CommunityReply.id == reply_id)
    )
    reply = result.scalar_one_or_none()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    if reply.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    discussion = await db.get(CommunityDiscussion, reply.discussion_id)
    if discussion:
        discussion.reply_count = max(0, discussion.reply_count - 1)

    await db.delete(reply)
    await db.commit()


@router.post("/discussions/{discussion_id}/like")
async def toggle_discussion_like(
    discussion_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    discussion = await db.get(CommunityDiscussion, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")

    discussion.like_count += 1
    await db.commit()
    return {"like_count": discussion.like_count}


@router.post("/replies/{reply_id}/like")
async def toggle_reply_like(
    reply_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    reply = await db.get(CommunityReply, reply_id)
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")

    reply.like_count += 1
    await db.commit()
    return {"like_count": reply.like_count}


@router.get("/trending")
async def get_trending_discussions(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CommunityDiscussion).where(CommunityDiscussion.is_active == True)
        .order_by(CommunityDiscussion.like_count.desc(), CommunityDiscussion.reply_count.desc())
        .limit(10)
    )
    discussions = result.scalars().all()

    items = []
    for d in discussions:
        user = await db.get(User, d.user_id)
        items.append(DiscussionResponse(
            id=d.id, user_id=d.user_id,
            user_name=user.full_name if user else "Unknown",
            user_avatar=user.avatar_url if user else None,
            product_id=d.product_id,
            title=d.title, content=d.content,
            tags=d.tags, like_count=d.like_count,
            reply_count=d.reply_count, is_pinned=d.is_pinned,
            created_at=d.created_at
        ))
    return items


@router.post("/share")
async def share_product(
    data: ShareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    share = ProductShare(
        id=uuid4(),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        platform=data.platform
    )
    db.add(share)
    await db.commit()
    return {"message": f"Product shared on {data.platform}"}
