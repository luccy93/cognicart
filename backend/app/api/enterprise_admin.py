from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, asc
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.feature_extensions import (
    AuditLog, FeatureFlag, ABTest
)
from app.models.enterprise import ABTestStatus, ABTestEvent
from app.schemas.enterprise import (
    AuditLogResponse, FeatureFlagCreate, FeatureFlagResponse,
    ABTestCreate, ABTestResponse
)
from app.auth.jwt import require_admin, require_super_admin

router = APIRouter(prefix="/api/admin", tags=["Enterprise Admin"])


@router.get("/audit-logs", response_model=dict)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    conditions = []
    if user_id:
        conditions.append(AuditLog.user_id == user_id)
    if action:
        conditions.append(AuditLog.action == action)
    if resource_type:
        conditions.append(AuditLog.entity_type == resource_type)
    if from_date:
        conditions.append(AuditLog.created_at >= from_date)
    if to_date:
        conditions.append(AuditLog.created_at <= to_date)

    total_q = await db.execute(
        select(func.count()).select_from(AuditLog).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(AuditLog).where(*conditions)
        .order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    logs = result.scalars().all()

    items = []
    for log in logs:
        items.append(AuditLogResponse(
            id=log.id, user_id=log.user_id,
            action=log.action,
            resource_type=log.entity_type,
            resource_id=log.entity_id or "",
            details={"old_value": log.old_value, "new_value": log.new_value},
            ip_address=log.ip_address or "",
            created_at=log.created_at
        ))

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
async def list_feature_flags(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(
        select(FeatureFlag).order_by(FeatureFlag.name)
    )
    flags = result.scalars().all()
    return [FeatureFlagResponse(
        id=f.id, name=f.name, description=f.description or "",
        is_enabled=f.enabled,
        rollout_percentage=f.metadata_json.get("rollout_percentage", 100) if f.metadata_json else 100,
        conditions=f.metadata_json.get("conditions") if f.metadata_json else None,
        created_at=f.created_at, updated_at=f.updated_at
    ) for f in flags]


@router.post("/feature-flags", response_model=FeatureFlagResponse, status_code=201)
async def create_feature_flag(
    data: FeatureFlagCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    existing = await db.execute(
        select(FeatureFlag).where(FeatureFlag.name == data.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Feature flag already exists")

    flag = FeatureFlag(
        id=uuid4(),
        name=data.name,
        description=data.description,
        enabled=data.is_enabled,
        enabled_for_roles=[],
        enabled_for_users=[],
        metadata_json={"rollout_percentage": data.rollout_percentage, "conditions": data.conditions}
    )
    db.add(flag)
    await db.commit()
    await db.refresh(flag)

    return FeatureFlagResponse(
        id=flag.id, name=flag.name, description=flag.description or "",
        is_enabled=flag.enabled,
        rollout_percentage=flag.metadata_json.get("rollout_percentage", 100) if flag.metadata_json else 100,
        conditions=flag.metadata_json.get("conditions") if flag.metadata_json else None,
        created_at=flag.created_at, updated_at=flag.updated_at
    )


@router.put("/feature-flags/{flag_id}", response_model=FeatureFlagResponse)
async def update_feature_flag(
    flag_id: UUID,
    data: FeatureFlagCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(FeatureFlag).where(FeatureFlag.id == flag_id))
    flag = result.scalar_one_or_none()
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")

    flag.name = data.name
    flag.description = data.description
    flag.enabled = data.is_enabled
    flag.metadata_json = {"rollout_percentage": data.rollout_percentage, "conditions": data.conditions}
    flag.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(flag)

    return FeatureFlagResponse(
        id=flag.id, name=flag.name, description=flag.description or "",
        is_enabled=flag.enabled,
        rollout_percentage=flag.metadata_json.get("rollout_percentage", 100) if flag.metadata_json else 100,
        conditions=flag.metadata_json.get("conditions") if flag.metadata_json else None,
        created_at=flag.created_at, updated_at=flag.updated_at
    )


@router.delete("/feature-flags/{flag_id}", status_code=204)
async def delete_feature_flag(
    flag_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(FeatureFlag).where(FeatureFlag.id == flag_id))
    flag = result.scalar_one_or_none()
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    await db.delete(flag)
    await db.commit()


@router.get("/ab-tests", response_model=List[ABTestResponse])
async def list_ab_tests(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(
        select(ABTest).order_by(ABTest.created_at.desc())
    )
    tests = result.scalars().all()

    items = []
    for t in tests:
        items.append(ABTestResponse(
            id=t.id, name=t.name,
            description=t.description or "",
            metric=t.experiment_type,
            variants=[
                {"name": "A", "weight": 0.5},
                {"name": "B", "weight": 0.5}
            ],
            weights=[0.5, 0.5],
            status="running" if t.is_active else "completed",
            started_at=t.started_at, ended_at=t.ended_at,
            created_at=t.created_at
        ))
    return items


@router.post("/ab-tests", response_model=ABTestResponse, status_code=201)
async def create_ab_test(
    data: ABTestCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    test = ABTest(
        id=uuid4(),
        name=data.name,
        description=data.description,
        experiment_type=data.metric,
        variant_a_config={"enabled": True},
        variant_b_config={"enabled": True},
        is_active=False
    )
    db.add(test)
    await db.commit()
    await db.refresh(test)

    return ABTestResponse(
        id=test.id, name=test.name,
        description=test.description or "",
        metric=test.experiment_type,
        variants=data.variants,
        weights=data.weights,
        status="draft",
        started_at=test.started_at, ended_at=test.ended_at,
        created_at=test.created_at
    )


@router.put("/ab-tests/{test_id}", response_model=ABTestResponse)
async def update_ab_test(
    test_id: UUID,
    data: ABTestCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(ABTest).where(ABTest.id == test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="A/B test not found")

    test.name = data.name
    test.description = data.description
    test.experiment_type = data.metric
    await db.commit()
    await db.refresh(test)

    return ABTestResponse(
        id=test.id, name=test.name,
        description=test.description or "",
        metric=test.experiment_type,
        variants=data.variants,
        weights=data.weights,
        status="running" if test.is_active else "draft",
        started_at=test.started_at, ended_at=test.ended_at,
        created_at=test.created_at
    )


@router.post("/ab-tests/{test_id}/start")
async def start_ab_test(
    test_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(ABTest).where(ABTest.id == test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="A/B test not found")
    if test.is_active:
        raise HTTPException(status_code=400, detail="Test is already running")

    test.is_active = True
    test.started_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "A/B test started"}


@router.post("/ab-tests/{test_id}/stop")
async def stop_ab_test(
    test_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(ABTest).where(ABTest.id == test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="A/B test not found")
    if not test.is_active:
        raise HTTPException(status_code=400, detail="Test is not running")

    test.is_active = False
    test.ended_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "A/B test stopped"}


@router.get("/ab-tests/{test_id}/results")
async def get_ab_test_results(
    test_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(ABTest).where(ABTest.id == test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="A/B test not found")

    events = await db.execute(
        select(ABTestEvent).where(ABTestEvent.test_id == test_id)
    )
    event_list = events.scalars().all()

    variant_a_events = [e for e in event_list if e.variant == "A"]
    variant_b_events = [e for e in event_list if e.variant == "B"]

    a_impressions = test.variant_a_impressions
    b_impressions = test.variant_b_impressions
    a_conversions = test.variant_a_conversions
    b_conversions = test.variant_b_conversions

    a_rate = a_conversions / a_impressions if a_impressions > 0 else 0
    b_rate = b_conversions / b_impressions if b_impressions > 0 else 0

    import math
    if a_impressions > 0 and b_impressions > 0:
        p_pool = (a_conversions + b_conversions) / (a_impressions + b_impressions)
        se = math.sqrt(p_pool * (1 - p_pool) * (1 / a_impressions + 1 / b_impressions))
        z = (b_rate - a_rate) / se if se > 0 else 0
        p_value = 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))
    else:
        z = 0
        p_value = 1

    return {
        "test_id": test_id,
        "test_name": test.name,
        "status": "completed" if not test.is_active else "running",
        "variants": {
            "A": {
                "impressions": a_impressions,
                "conversions": a_conversions,
                "conversion_rate": round(a_rate, 4),
                "events": len(variant_a_events)
            },
            "B": {
                "impressions": b_impressions,
                "conversions": b_conversions,
                "conversion_rate": round(b_rate, 4),
                "events": len(variant_b_events)
            }
        },
        "statistics": {
            "z_score": round(z, 4),
            "p_value": round(p_value, 4),
            "significant": p_value < 0.05,
            "winner": "B" if b_rate > a_rate and p_value < 0.05 else ("A" if a_rate > b_rate and p_value < 0.05 else "none")
        }
    }
