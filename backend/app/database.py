from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
from app.config import settings


async_engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, pool_size=20, max_overflow=10)
sync_engine = create_engine(settings.DATABASE_URL_SYNC, echo=settings.DEBUG)

AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_db():
    from sqlalchemy.orm import Session
    from sqlalchemy import create_engine
    engine = create_engine(settings.DATABASE_URL_SYNC)
    with Session(engine) as session:
        yield session
