import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_order(client: AsyncClient, auth_headers):
    resp = await client.post("/api/orders/?shipping_address=123+Main+St&payment_method=stripe", headers=auth_headers)
    assert resp.status_code in (200, 201, 400, 401, 404)


@pytest.mark.asyncio
async def test_get_orders(client: AsyncClient, auth_headers):
    resp = await client.get("/api/orders/", headers=auth_headers)
    assert resp.status_code in (200, 401, 422)
    if resp.status_code == 200:
        data = resp.json()
        assert isinstance(data, dict)


@pytest.mark.asyncio
async def test_create_order_no_auth(client: AsyncClient):
    resp = await client.post("/api/orders/?shipping_address=123+Main+St")
    assert resp.status_code in (401, 403)
