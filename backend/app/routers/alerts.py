from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.alert import Alert, AlertOut
from app.models.user import User
from app.services.token_service import get_current_user

router = APIRouter()

def to_out(a: Alert) -> AlertOut:
    return AlertOut(
        id=str(a.id),
        level=a.level,
        title=a.title,
        message=a.message,
        read=a.read,
        created_at=a.created_at,
        process_id=a.process_id,
    )

@router.get("/", response_model=List[AlertOut])
async def list_alerts(unread_only: bool = False, current_user: User = Depends(get_current_user)):
    user_id = str(current_user.id)
    query = Alert.find(Alert.user_id == user_id)
    if unread_only:
        query = query.find(Alert.read == False)
    alerts = await query.sort(-Alert.created_at).to_list()
    return [to_out(a) for a in alerts]

@router.patch("/{alert_id}/read")
async def mark_read(alert_id: str, current_user: User = Depends(get_current_user)):
    alert = await Alert.get(alert_id)
    if not alert or alert.user_id != str(current_user.id):
        raise HTTPException(404, "Alerta não encontrado")
    await alert.update({"$set": {"read": True}})
    return {"ok": True}

@router.patch("/read-all")
async def mark_all_read(current_user: User = Depends(get_current_user)):
    user_id = str(current_user.id)
    await Alert.find(Alert.user_id == user_id).update({"$set": {"read": True}})
    return {"ok": True}
