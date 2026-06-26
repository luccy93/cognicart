import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import *

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session():
    async with TestSessionLocal() as session:
        yield session


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_headers(client, db_session):
    from app.models.user import User, UserRole
    from app.auth.jwt import hash_password as create_password_hash
    import uuid
    user = User(
        id=uuid.uuid4(), email="test@test.com", password_hash=create_password_hash("Test@123"),
        full_name="Test User", role=UserRole.CUSTOMER, is_verified=True
    )
    db_session.add(user)
    await db_session.commit()

    resp = await client.post("/api/auth/login", json={"email": "test@test.com", "password": "Test@123"})
    data = resp.json()
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}
