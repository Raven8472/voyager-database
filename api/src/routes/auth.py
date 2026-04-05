from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from ..support import (
    auth_tables_exist,
    create_user_session,
    execute_write,
    fetch_one,
    get_current_user,
    hash_password,
    hash_session_token,
    normalize_email,
    serialize_user,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthRegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=200)


class AuthLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=200)


@router.post("/register")
def register_user(payload: AuthRegisterRequest):
    if not auth_tables_exist():
        raise HTTPException(status_code=503, detail="Authentication schema has not been installed yet")

    normalized_email = normalize_email(payload.email)
    existing_user = fetch_one("SELECT user_id FROM users WHERE email = %s", (normalized_email,))
    if existing_user:
        raise HTTPException(status_code=409, detail="An account already exists for that access ID")

    user_id = execute_write(
        """
        INSERT INTO users (
            email,
            password_hash,
            created_at,
            is_active
        ) VALUES (%s, %s, %s, %s)
        """,
        (
            normalized_email,
            hash_password(payload.password),
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            1,
        ),
    )
    user = fetch_one(
        """
        SELECT user_id, email, created_at, last_login_at
        FROM users
        WHERE user_id = %s
        """,
        (user_id,),
    )
    token, expires_at = create_user_session(user_id)
    return {"status": "ok", "token": token, "expires_at": expires_at, "user": serialize_user(user)}


@router.post("/login")
def login_user(payload: AuthLoginRequest):
    if not auth_tables_exist():
        raise HTTPException(status_code=503, detail="Authentication schema has not been installed yet")

    normalized_email = normalize_email(payload.email)
    user = fetch_one(
        """
        SELECT user_id, email, password_hash, created_at, last_login_at, is_active
        FROM users
        WHERE email = %s
        """,
        (normalized_email,),
    )
    if not user or not user["is_active"] or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Access denied. Credentials not recognized")

    token, expires_at = create_user_session(user["user_id"])
    return {"status": "ok", "token": token, "expires_at": expires_at, "user": serialize_user(user)}


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {"status": "ok", "user": serialize_user(current_user)}


@router.post("/logout")
def logout_user(authorization: str | None = Header(default=None), current_user=Depends(get_current_user)):
    token = authorization.removeprefix("Bearer ").strip()
    execute_write(
        """
        UPDATE user_sessions
        SET revoked_at = %s
        WHERE token_hash = %s
        """,
        (
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            hash_session_token(token),
        ),
    )
    return {"status": "ok"}
