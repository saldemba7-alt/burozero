from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import secrets


class User(Document):
    email:          str
    name:           Optional[str] = None
    nif:            Optional[str] = None          # NIF pessoal ou empresa
    push_token:     Optional[str] = None          # Expo push token
    otp_code:       Optional[str] = None
    otp_expires_at: Optional[datetime] = None
    verified:       bool = False
    created_at:     datetime = Field(default_factory=datetime.utcnow)
    last_login:     Optional[datetime] = None

    class Settings:
        name = "users"

    def generate_otp(self) -> str:
        code = str(secrets.randbelow(900000) + 100000)  # 6 dígitos
        from datetime import timedelta
        self.otp_code = code
        self.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
        return code

    def verify_otp(self, code: str) -> bool:
        if not self.otp_code or not self.otp_expires_at:
            return False
        if datetime.utcnow() > self.otp_expires_at:
            return False
        return self.otp_code == code


# ── Schemas ───────────────────────────────────────────────────

class AuthRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    code:  str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      str
    email:        str

class RegisterPushToken(BaseModel):
    push_token: str

class UserOut(BaseModel):
    id:         str
    email:      str
    name:       Optional[str]
    nif:        Optional[str]
    verified:   bool
    created_at: datetime
