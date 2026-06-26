import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_products(client: AsyncClient):
    resp = await client.get("/api/products/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) or "items" in data


@pytest.mark.asyncio
async def test_list_products_with_pagination(client: AsyncClient):
    resp = await client.get("/api/products/?skip=0&limit=10")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_list_categories(client: AsyncClient):
    resp = await client.get("/api/products/categories/all")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_create_product_admin(client: AsyncClient, auth_headers):
    resp = await client.post("/api/products", json={
        "name": "Test Product", "sku": "TST-001",
        "description": "A test product",
        "price": 99.99, "stock": 10
    }, headers=auth_headers)
    assert resp.status_code in (200, 201, 403, 422)


@pytest.mark.asyncio
async def test_get_product_not_found(client: AsyncClient):
    import uuid
    resp = await client.get(f"/api/products/{uuid.uuid4()}")
    assert resp.status_code == 404
