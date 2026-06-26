from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.additional import Notification
from app.models.feature_extensions import NotificationSchedule, NotificationType
from app.schemas.enterprise import (
    NotificationResponse, NotificationSettingsUpdate, NotificationSendRequest
)
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=dict)
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_q = await db.execute(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == current_user["user_id"]
        )
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Notification).where(Notification.user_id == current_user["user_id"])
        .order_by(Notification.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    notifications = result.scalars().all()

    items = []
    for n in notifications:
        items.append(NotificationResponse(
            id=n.id, type=n.type, title=n.title,
            message=n.message, icon=n.icon, link=n.link,
            is_read=n.is_read, created_at=n.created_at
        ))

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/unread-count")
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == current_user["user_id"],
            Notification.is_read == False
        )
    )
    count = result.scalar()
    return {"unread_count": count}


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user["user_id"]
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    await db.commit()
    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await db.execute(
        update(Notification).where(
            Notification.user_id == current_user["user_id"],
            Notification.is_read == False
        ).values(is_read=True)
    )
    await db.commit()
    return {"message": "All notifications marked as read"}


@router.get("/settings", response_model=NotificationSettingsUpdate)
async def get_notification_settings(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(NotificationSchedule).where(
            NotificationSchedule.user_id == current_user["user_id"]
        )
    )
    schedules = result.scalars().all()

    email = any(s.channel == "email" and s.enabled for s in schedules)
    sms = any(s.channel == "sms" and s.enabled for s in schedules)
    push = any(s.channel == "push" and s.enabled for s in schedules)
    categories = list(set(s.notification_type.value if hasattr(s.notification_type, 'value') else s.notification_type for s in schedules if s.enabled))

    return NotificationSettingsUpdate(
        email_enabled=email,
        sms_enabled=sms,
        push_enabled=push,
        categories=categories
    )


@router.put("/settings", response_model=NotificationSettingsUpdate)
async def update_notification_settings(
    data: NotificationSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await db.execute(
        update(NotificationSchedule).where(
            NotificationSchedule.user_id == current_user["user_id"]
        ).values(enabled=False)
    )

    channels = []
    if data.email_enabled:
        channels.append("email")
    if data.sms_enabled:
        channels.append("sms")
    if data.push_enabled:
        channels.append("push")

    for channel in channels:
        for category in data.categories:
            existing = await db.execute(
                select(NotificationSchedule).where(
                    NotificationSchedule.user_id == current_user["user_id"],
                    NotificationSchedule.notification_type == NotificationType(category),
                    NotificationSchedule.channel == channel
                )
            )
            if not existing.scalar_one_or_none():
                schedule = NotificationSchedule(
                    id=uuid4(),
                    user_id=current_user["user_id"],
                    notification_type=NotificationType(category),
                    channel=channel,
                    enabled=True
                )
                db.add(schedule)
            else:
                await db.execute(
                    update(NotificationSchedule).where(
                        NotificationSchedule.user_id == current_user["user_id"],
                        NotificationSchedule.notification_type == NotificationType(category),
                        NotificationSchedule.channel == channel
                    ).values(enabled=True)
                )

    await db.commit()
    return data


@router.post("/send")
async def send_notification(
    data: NotificationSendRequest,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    notification = Notification(
        id=uuid4(),
        user_id=data.user_id,
        type=data.type,
        title=data.title,
        message=data.message
    )
    db.add(notification)
    await db.commit()
    return {"message": "Notification sent", "id": notification.id}
