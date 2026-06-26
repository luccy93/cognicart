import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4
from datetime import timedelta, datetime, timezone

from app.database import get_db
from app.models.user import User, UserRole, UserSession, EmailVerification
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    TokenRefresh, ForgotPassword, ResetPassword, VerifyOTP, OAuthLogin,
    VerifyEmail, ResendOTP, SendLoginOTP, VerifyLoginOTP
)
from app.auth.jwt import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, get_current_user
)
from app.auth.otp import generate_otp, hash_otp, verify_otp_hash
from app.tasks.email_tasks import send_otp_email, send_welcome_email, send_account_verified_email, send_otp_email_direct
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

MAX_OTP_ATTEMPTS = 5
OTP_EXPIRY_MINUTES = 5
RESEND_COOLDOWN_SECONDS = 60
MAX_RESEND_PER_HOUR = 3
MAX_LOGIN_ATTEMPTS = 5


async def _get_user_by_email(email: str, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def _invalidate_previous_otps(user_id, purpose: str, db: AsyncSession):
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user_id,
            EmailVerification.purpose == purpose,
            EmailVerification.is_used == False
        )
    )
    for record in result.scalars().all():
        record.is_used = True
    await db.commit()


async def _create_session(user: User, db: AsyncSession) -> TokenResponse:
    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)

    session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await _get_user_by_email(data.email, db)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=uuid4(),
        email=data.email,
        full_name=data.full_name,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=UserRole.CUSTOMER
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    verification = EmailVerification(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES),
        purpose="registration"
    )
    db.add(verification)
    await db.commit()

    send_otp_email_direct(data.email, otp, "verification")

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)

    session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session)
    await db.commit()

    resp = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    if settings.DEBUG:
        resp_dict = resp.model_dump()
        resp_dict["dev_otp"] = otp
        from fastapi.responses import JSONResponse
        return JSONResponse(content=resp_dict, status_code=status.HTTP_201_CREATED)
    return resp


@router.post("/verify-email")
async def verify_email(data: VerifyEmail, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(data.email, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_email_verified:
        return {"message": "Email already verified"}

    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.purpose == "registration",
            EmailVerification.is_used == False
        ).order_by(EmailVerification.created_at.desc()).limit(1)
    )
    verification = result.scalar_one_or_none()
    if not verification:
        raise HTTPException(status_code=400, detail="No OTP found. Request a new one.")

    if datetime.now(timezone.utc).replace(tzinfo=None) > verification.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")

    verification.attempt_count += 1
    if verification.attempt_count > MAX_OTP_ATTEMPTS:
        verification.is_used = True
        await db.commit()
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new OTP.")

    if not verify_otp_hash(data.otp, verification.otp_hash):
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    verification.is_used = True
    user.is_email_verified = True
    user.is_verified = True
    user.email_verified_at = datetime.now(timezone.utc)
    await db.commit()

    send_otp_email_direct(user.email, "verified", "verification")

    return {"message": "Email verified successfully"}


@router.post("/resend-otp")
async def resend_otp(data: ResendOTP, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(data.email, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.purpose == "registration" and user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.purpose == data.purpose,
            EmailVerification.created_at > cutoff
        )
    )
    recent_count = len(result.scalars().all())
    if recent_count >= MAX_RESEND_PER_HOUR:
        raise HTTPException(status_code=429, detail="Too many resend requests. Try again later.")

    await _invalidate_previous_otps(user.id, data.purpose, db)

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    verification = EmailVerification(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES),
        purpose=data.purpose
    )
    db.add(verification)
    await db.commit()

    send_otp_email_direct(data.email, otp, data.purpose)

    return {"message": "OTP sent successfully"}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(data.email, db)
    if not user or not verify_password(data.password, user.password_hash):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                user.is_active = False
            await db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact support.")

    if not user.is_email_verified:
        otp = generate_otp()
        otp_hash = hash_otp(otp)
        await _invalidate_previous_otps(user.id, "registration", db)
        verification = EmailVerification(
            user_id=user.id,
            otp_hash=otp_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES),
            purpose="registration"
        )
        db.add(verification)
        await db.commit()
        send_otp_email_direct(data.email, otp, "verification")
        raise HTTPException(
            status_code=403,
            detail="Email not verified. A new verification code has been sent to your email."
        )

    user.failed_login_attempts = 0
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    return await _create_session(user, db)


@router.post("/send-login-otp")
async def send_login_otp(data: SendLoginOTP, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(data.email, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await _invalidate_previous_otps(user.id, "login", db)

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    verification = EmailVerification(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES),
        purpose="login"
    )
    db.add(verification)
    await db.commit()

    send_otp_email_direct(data.email, otp, "login")

    return {"message": "Login OTP sent to your email"}


@router.post("/verify-login-otp", response_model=TokenResponse)
async def verify_login_otp(data: VerifyLoginOTP, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(data.email, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.purpose == "login",
            EmailVerification.is_used == False
        ).order_by(EmailVerification.created_at.desc()).limit(1)
    )
    verification = result.scalar_one_or_none()
    if not verification:
        raise HTTPException(status_code=400, detail="No login OTP found. Request a new one.")

    if datetime.now(timezone.utc).replace(tzinfo=None) > verification.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")

    verification.attempt_count += 1
    if verification.attempt_count > MAX_OTP_ATTEMPTS:
        verification.is_used = True
        await db.commit()
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new OTP.")

    if not verify_otp_hash(data.otp, verification.otp_hash):
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    verification.is_used = True
    user.last_login = datetime.now(timezone.utc)
    user.failed_login_attempts = 0
    await db.commit()

    return await _create_session(user, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    result = await db.execute(
        select(UserSession).where(
            UserSession.refresh_token == data.refresh_token,
            UserSession.is_active == True
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=401, detail="Session expired")

    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token(user.id, user.role.value)
    new_refresh_token = create_refresh_token(user.id)

    session.refresh_token = new_refresh_token
    session.expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await db.commit()

    resp = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    if settings.DEBUG:
        resp_dict = resp.model_dump()
        resp_dict["dev_otp"] = otp
        from fastapi.responses import JSONResponse
        return JSONResponse(content=resp_dict, status_code=status.HTTP_201_CREATED)
    return resp


@router.post("/logout")
async def logout(
    data: TokenRefresh,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(UserSession).where(
            UserSession.refresh_token == data.refresh_token,
            UserSession.user_id == current_user["user_id"]
        )
    )
    session = result.scalar_one_or_none()
    if session:
        session.is_active = False
        await db.commit()
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(data.email, db)
    if not user:
        return {"message": "If the email exists, a reset code has been sent"}

    await _invalidate_previous_otps(user.id, "password_reset", db)

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    verification = EmailVerification(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES),
        purpose="password_reset"
    )
    db.add(verification)
    await db.commit()

    send_otp_email_direct(data.email, otp, "password_reset")

    return {"message": "If the email exists, a reset code has been sent"}


@router.post("/verify-reset-otp")
async def verify_reset_otp(data: VerifyOTP, db: AsyncSession = Depends(get_db)):
    user = await _get_user_by_email(data.email, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.purpose == "password_reset",
            EmailVerification.is_used == False
        ).order_by(EmailVerification.created_at.desc()).limit(1)
    )
    verification = result.scalar_one_or_none()
    if not verification:
        raise HTTPException(status_code=400, detail="No reset OTP found. Request a new one.")

    if datetime.now(timezone.utc).replace(tzinfo=None) > verification.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")

    verification.attempt_count += 1
    if verification.attempt_count > MAX_OTP_ATTEMPTS:
        verification.is_used = True
        await db.commit()
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new OTP.")

    if not verify_otp_hash(data.otp, verification.otp_hash):
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    verification.is_used = True
    await db.commit()

    reset_token = create_access_token(user.id, user.role.value)

    return {"message": "OTP verified", "reset_token": reset_token}


@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.token)
    user_id = payload.get("sub")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(data.password)
    await db.commit()
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def _github_oauth(token: str, db: AsyncSession) -> User:
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"}
        user_resp = await client.get("https://api.github.com/user", headers=headers)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid GitHub token")
        gh_user = user_resp.json()

    github_id = str(gh_user.get("id"))
    login = gh_user.get("login")
    name = gh_user.get("name") or login
    avatar = gh_user.get("avatar_url")
    email = gh_user.get("email")

    if not email:
        async with httpx.AsyncClient(timeout=10) as client:
            emails_resp = await client.get(
                "https://api.github.com/user/emails",
                headers=headers,
            )
            if emails_resp.status_code == 200:
                for e in emails_resp.json():
                    if e.get("primary") and e.get("verified"):
                        email = e.get("email")
                        break

        if not email:
            raise HTTPException(
                status_code=400,
                detail="No public email found on GitHub. Please set a primary verified email."
            )

    user = await _get_user_by_email(email, db)

    if user:
        if user.is_oauth and user.oauth_provider == "github" and user.oauth_id == github_id:
            pass
        elif not user.is_oauth:
            user.is_oauth = True
            user.oauth_provider = "github"
            user.oauth_id = github_id
            if avatar:
                user.avatar_url = avatar
        else:
            raise HTTPException(status_code=409, detail="Email already registered with a different provider")
    else:
        user = User(
            id=uuid4(),
            email=email,
            full_name=name,
            avatar_url=avatar,
            password_hash=hash_password(str(uuid4())),
            role=UserRole.CUSTOMER,
            is_oauth=True,
            oauth_provider="github",
            oauth_id=github_id,
            is_email_verified=True,
            is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/oauth", response_model=TokenResponse)
async def oauth_login(data: OAuthLogin, db: AsyncSession = Depends(get_db)):
    if data.provider not in ("google", "github", "apple"):
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")

    if data.provider == "google":
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=400, detail="Google OAuth not configured")

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    f"https://oauth2.googleapis.com/tokeninfo?id_token={data.token}"
                )
                if resp.status_code != 200:
                    raise HTTPException(status_code=401, detail="Invalid Google token")
                google_data = resp.json()

            google_id = google_data.get("sub")
            email = google_data.get("email")
            name = google_data.get("name", email.split("@")[0])
            avatar = google_data.get("picture")

            if not email or not google_id:
                raise HTTPException(status_code=401, detail="Invalid Google token: missing data")

            if google_data.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(status_code=401, detail="Token audience mismatch")

        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Failed to verify Google token")

        user = await _get_user_by_email(email, db)

        if user:
            if user.is_oauth and user.oauth_provider == "google" and user.oauth_id == google_id:
                pass
            elif not user.is_oauth:
                user.is_oauth = True
                user.oauth_provider = "google"
                user.oauth_id = google_id
                if avatar:
                    user.avatar_url = avatar
            else:
                raise HTTPException(status_code=409, detail="Email already registered with a different provider")
        else:
            user = User(
                id=uuid4(),
                email=email,
                full_name=name,
                avatar_url=avatar,
                password_hash=hash_password(str(uuid4())),
                role=UserRole.CUSTOMER,
                is_oauth=True,
                oauth_provider="google",
                oauth_id=google_id,
                is_email_verified=True,
                is_verified=True,
                email_verified_at=datetime.now(timezone.utc),
            )
            db.add(user)

        await db.commit()
        await db.refresh(user)

        return await _create_session(user, db)

    if data.provider == "github":
        user = await _github_oauth(data.token, db)
        return await _create_session(user, db)

    raise HTTPException(status_code=400, detail="Unsupported OAuth provider")


@router.post("/github/token", response_model=TokenResponse)
async def github_exchange_code(
    data: OAuthLogin,
    db: AsyncSession = Depends(get_db),
):
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="GitHub OAuth not configured")

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": data.token,
            },
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to exchange GitHub code")
        token_data = resp.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Invalid GitHub code or OAuth app misconfigured")

    user = await _github_oauth(access_token, db)
    return await _create_session(user, db)
