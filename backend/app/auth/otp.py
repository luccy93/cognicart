import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))


def hash_otp(otp: str) -> str:
    return pwd_context.hash(otp)


def verify_otp_hash(otp: str, otp_hash: str) -> bool:
    return pwd_context.verify(otp, otp_hash)
