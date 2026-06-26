import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_recommendations(client: AsyncClient, auth_headers):
    resp = await client.get("/api/recommendations/personalized", headers=auth_headers)
    assert resp.status_code in (200, 401)


@pytest.mark.asyncio
async def test_get_trending(client: AsyncClient):
    resp = await client.get("/api/recommendations/trending")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_trending_with_limit(client: AsyncClient):
    resp = await client.get("/api/recommendations/trending?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    if isinstance(data, list):
        assert len(data) <= 5


@pytest.mark.asyncio
async def test_get_frequently_bought(client: AsyncClient):
    import uuid
    resp = await client.get(f"/api/recommendations/frequently-bought/{uuid.uuid4()}")
    assert resp.status_code in (200, 404)
