"""tests/test_auth.py — Authentication API Tests"""

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post("/api/auth/register", json={
        "name": "New User",
        "email": "newuser@test.com",
        "password": "StrongPass@123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "newuser@test.com"

@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    # First registration
    await client.post("/api/auth/register", json={
        "name": "User One",
        "email": "dup@test.com",
        "password": "StrongPass@123",
    })
    # Second registration with same email
    response = await client.post("/api/auth/register", json={
        "name": "User Two",
        "email": "dup@test.com",
        "password": "StrongPass@123",
    })
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, citizen_user):
    response = await client.post("/api/auth/login", json={
        "email": "citizen@test.com",
        "password": "Citizen@Test123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]

@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, citizen_user):
    response = await client.post("/api/auth/login", json={
        "email": "citizen@test.com",
        "password": "WrongPassword",
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, citizen_token: str):
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["role"] == "citizen"

@pytest.mark.asyncio
async def test_get_me_no_token(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_admin_can_access_admin_route(client: AsyncClient, admin_token: str):
    response = await client.get(
        "/api/admin/stats",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_citizen_cannot_access_admin_route(client: AsyncClient, citizen_token: str):
    response = await client.get(
        "/api/admin/stats",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert response.status_code == 403
