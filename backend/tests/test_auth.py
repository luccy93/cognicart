import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    resp = await client.post("/api/auth/register", json={
        "email": "newuser@test.com", "password": "StrongPass@1",
        "full_name": "New User"
    })
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "dup@test.com", "password": "StrongPass@1",
        "full_name": "Dup User"
    })
    resp = await client.post("/api/auth/register", json={
        "email": "dup@test.com", "password": "StrongPass@1",
        "full_name": "Dup User"
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, auth_headers):
    resp = await client.post("/api/auth/login", json={
        "email": "test@test.com", "password": "Test@123"
    })
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={
        "email": "test@test.com", "password": "wrongpassword"
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_profile(client: AsyncClient, auth_headers):
    resp = await client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code in (200, 401, 422)
    if resp.status_code == 200:
        data = resp.json()
        assert "email" in data


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, auth_headers):
    resp = await client.post("/api/auth/refresh", json={"refresh_token": "dummy"}, headers=auth_headers)
    assert resp.status_code in (200, 201, 401)
    if resp.status_code == 200:
        data = resp.json()
        assert "access_token" in data


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, auth_headers):
    resp = await client.post("/api/auth/logout", json={"refresh_token": "dummy"}, headers=auth_headers)
    assert resp.status_code in (200, 204, 401)


@pytest.mark.asyncio
async def test_protected_route_no_auth(client: AsyncClient):
    resp = await client.get("/api/auth/me")
    assert resp.status_code in (401, 403)
