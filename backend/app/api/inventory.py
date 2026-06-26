from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import joinedload
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.enterprise import (
    Inventory, InventoryTransaction, InventoryTransactionType,
    Warehouse
)
from app.models.product import Product
from app.schemas.enterprise import (
    InventoryResponse, InventoryUpdate, InventoryTransactionResponse
)
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("", response_model=dict)
async def list_inventory(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    warehouse_id: Optional[UUID] = None,
    product_id: Optional[UUID] = None,
    low_stock: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    conditions = []
    if warehouse_id:
        conditions.append(Inventory.warehouse_id == warehouse_id)
    if product_id:
        conditions.append(Inventory.product_id == product_id)
    if low_stock:
        conditions.append(Inventory.quantity < Inventory.low_stock_threshold)

    total_q = await db.execute(
        select(func.count()).select_from(Inventory).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Inventory).options(
            joinedload(Inventory.product),
            joinedload(Inventory.warehouse)
        ).where(*conditions)
        .order_by(Inventory.updated_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    items = result.unique().scalars().all()

    response_items = []
    for inv in items:
        response_items.append(InventoryResponse(
            id=inv.id,
            product_id=inv.product_id,
            warehouse_id=inv.warehouse_id,
            product_name=inv.product.name if inv.product else "",
            warehouse_name=inv.warehouse.name if inv.warehouse else "",
            quantity=inv.quantity,
            reserved_quantity=inv.reserved_quantity,
            available_quantity=inv.quantity - inv.reserved_quantity,
            low_stock_threshold=inv.low_stock_threshold,
            reorder_point=inv.reorder_point
        ))

    return {"items": response_items, "total": total, "page": page, "page_size": page_size}


@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory(inventory_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Inventory).options(
            joinedload(Inventory.product),
            joinedload(Inventory.warehouse)
        ).where(Inventory.id == inventory_id)
    )
    inv = result.unique().scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    return InventoryResponse(
        id=inv.id,
        product_id=inv.product_id,
        warehouse_id=inv.warehouse_id,
        product_name=inv.product.name if inv.product else "",
        warehouse_name=inv.warehouse.name if inv.warehouse else "",
        quantity=inv.quantity,
        reserved_quantity=inv.reserved_quantity,
        available_quantity=inv.quantity - inv.reserved_quantity,
        low_stock_threshold=inv.low_stock_threshold,
        reorder_point=inv.reorder_point
    )


@router.put("/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(
    inventory_id: UUID,
    data: InventoryUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(
        select(Inventory).options(
            joinedload(Inventory.product),
            joinedload(Inventory.warehouse)
        ).where(Inventory.id == inventory_id)
    )
    inv = result.unique().scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(inv, key, value)
    inv.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(inv)

    return InventoryResponse(
        id=inv.id,
        product_id=inv.product_id,
        warehouse_id=inv.warehouse_id,
        product_name=inv.product.name if inv.product else "",
        warehouse_name=inv.warehouse.name if inv.warehouse else "",
        quantity=inv.quantity,
        reserved_quantity=inv.reserved_quantity,
        available_quantity=inv.quantity - inv.reserved_quantity,
        low_stock_threshold=inv.low_stock_threshold,
        reorder_point=inv.reorder_point
    )


@router.get("/transactions", response_model=dict)
async def list_inventory_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: Optional[UUID] = None,
    warehouse_id: Optional[UUID] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    conditions = []
    if product_id:
        conditions.append(InventoryTransaction.product_id == product_id)
    if warehouse_id:
        conditions.append(InventoryTransaction.warehouse_id == warehouse_id)
    if type:
        conditions.append(InventoryTransaction.type == InventoryTransactionType(type))

    total_q = await db.execute(
        select(func.count()).select_from(InventoryTransaction).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(InventoryTransaction).where(*conditions)
        .order_by(InventoryTransaction.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    transactions = result.scalars().all()

    return {"items": transactions, "total": total, "page": page, "page_size": page_size}


@router.post("/transactions", response_model=InventoryTransactionResponse, status_code=201)
async def create_inventory_transaction(
    product_id: UUID,
    warehouse_id: UUID,
    type: str,
    quantity: int,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    transaction = InventoryTransaction(
        id=uuid4(),
        product_id=product_id,
        warehouse_id=warehouse_id,
        type=InventoryTransactionType(type),
        quantity=quantity,
        notes=notes
    )
    db.add(transaction)

    inv_result = await db.execute(
        select(Inventory).where(
            Inventory.product_id == product_id,
            Inventory.warehouse_id == warehouse_id
        )
    )
    inv = inv_result.scalar_one_or_none()
    if inv:
        if type in ("inbound", "return"):
            inv.quantity += quantity
        elif type == "outbound":
            inv.quantity -= quantity
        else:
            inv.quantity = quantity
        inv.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(transaction)
    return transaction


@router.get("/warehouses", response_model=list)
async def list_warehouses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Warehouse).where(Warehouse.is_active == True).order_by(Warehouse.name)
    )
    warehouses = result.scalars().all()
    return warehouses


@router.post("/warehouses", status_code=201)
async def create_warehouse(
    name: str,
    address: str,
    city: str,
    country: str,
    postal_code: str,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    warehouse = Warehouse(
        id=uuid4(),
        name=name,
        address=address,
        city=city,
        state=state,
        country=country,
        postal_code=postal_code
    )
    db.add(warehouse)
    await db.commit()
    await db.refresh(warehouse)
    return {"id": warehouse.id, "name": warehouse.name, "message": "Warehouse created"}


@router.get("/alerts/low-stock", response_model=List[InventoryResponse])
async def get_low_stock_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Inventory).options(
            joinedload(Inventory.product),
            joinedload(Inventory.warehouse)
        ).where(Inventory.quantity < Inventory.low_stock_threshold)
        .order_by(Inventory.quantity.asc())
    )
    items = result.unique().scalars().all()

    response_items = []
    for inv in items:
        response_items.append(InventoryResponse(
            id=inv.id,
            product_id=inv.product_id,
            warehouse_id=inv.warehouse_id,
            product_name=inv.product.name if inv.product else "",
            warehouse_name=inv.warehouse.name if inv.warehouse else "",
            quantity=inv.quantity,
            reserved_quantity=inv.reserved_quantity,
            available_quantity=inv.quantity - inv.reserved_quantity,
            low_stock_threshold=inv.low_stock_threshold,
            reorder_point=inv.reorder_point
        ))
    return response_items
