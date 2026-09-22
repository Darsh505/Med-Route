"""
tests/conftest.py — Pytest Fixtures for Med Route API Tests
"""

import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import get_db, Base
from app.models.user import User, UserRole
from app.services.auth_service import hash_password, create_access_token

# Use in-memory SQLite for tests (no PostGIS — spatial tests use mocks)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Use a single event loop for the entire test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    """Test client with DB session override."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    user = User(
        name="Test Admin",
        email="admin@test.com",
        password_hash=hash_password("Admin@Test123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest_asyncio.fixture
async def citizen_user(db_session: AsyncSession) -> User:
    user = User(
        name="Test Citizen",
        email="citizen@test.com",
        password_hash=hash_password("Citizen@Test123"),
        role=UserRole.CITIZEN,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest.fixture
def admin_token(admin_user: User) -> str:
    return create_access_token(str(admin_user.id), admin_user.role.value)


@pytest.fixture
def citizen_token(citizen_user: User) -> str:
    return create_access_token(str(citizen_user.id), citizen_user.role.value)
