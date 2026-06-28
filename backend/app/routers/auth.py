from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.models.user import User, AuthRequest, OTPVerify, TokenResponse, RegisterPushToken, UserOut
from app.services.email_service import send_otp_email
from app.services.token_service import create_token, get_current_user

router = APIRouter()


@router.post("/request-otp")
async def request_otp(body: AuthRequest):
    """
    Passo 1: utilizador insere o email.
    Criamos conta se não existir, geramos OTP e enviamos por email.
    """
    email = body.email.lower().strip()
    user  = await User.find_one(User.email == email)

    if not user:
        user = User(email=email)
        await user.insert()

    otp = user.generate_otp()
    await user.save()

    sent = send_otp_email(email, otp)
    if not sent:
        raise HTTPException(500, "Erro ao enviar email. Tenta novamente.")

    return {"ok": True, "message": f"Código enviado para {email}", "dev_otp": otp}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(body: OTPVerify):
    """
    Passo 2: utilizador insere o código de 6 dígitos.
    Devolve um JWT válido por 30 dias.
    """
    email = body.email.lower().strip()
    user  = await User.find_one(User.email == email)

    if not user:
        raise HTTPException(404, "Email não registado")

    if not user.verify_otp(body.code):
        raise HTTPException(400, "Código inválido ou expirado")

    # Limpar OTP após uso
    user.otp_code       = None
    user.otp_expires_at = None
    user.verified       = True
    user.last_login     = datetime.utcnow()
    await user.save()

    token = create_token(str(user.id), user.email)

    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        email=user.email,
    )


@router.post("/push-token")
async def register_push_token(
    body: RegisterPushToken,
    current_user: User = Depends(get_current_user),
):
    """Regista o Expo push token do dispositivo do utilizador."""
    current_user.push_token = body.push_token
    await current_user.save()
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        nif=current_user.nif,
        verified=current_user.verified,
        created_at=current_user.created_at,
    )


@router.delete("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Remove o push token ao fazer logout."""
    current_user.push_token = None
    await current_user.save()
    return {"ok": True}
