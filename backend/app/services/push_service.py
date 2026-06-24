import httpx
from typing import List, Optional
from app.models.user import User
from app.models.alert import Alert, AlertLevel


EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

LEVEL_SOUNDS = {
    AlertLevel.URGENT:  "default",
    AlertLevel.WARNING: "default",
    AlertLevel.INFO:    None,
}


async def send_push(
    push_token: str,
    title:      str,
    body:       str,
    level:      AlertLevel = AlertLevel.INFO,
    data:       Optional[dict] = None,
) -> bool:
    """
    Envia uma notificação push via Expo Push API.
    Funciona com iOS e Android sem configuração extra.
    """
    if not push_token or not push_token.startswith("ExponentPushToken"):
        return False

    payload = {
        "to":    push_token,
        "title": title,
        "body":  body,
        "sound": LEVEL_SOUNDS.get(level, "default"),
        "data":  data or {},
        "badge": 1,
        "priority": "high" if level == AlertLevel.URGENT else "normal",
    }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                EXPO_PUSH_URL,
                json=payload,
                headers={"Accept": "application/json", "Content-Type": "application/json"},
                timeout=10,
            )
            result = res.json()
            status = result.get("data", {}).get("status")
            if status == "error":
                print(f"Expo push error: {result}")
                return False
            return True
    except Exception as e:
        print(f"Push notification error: {e}")
        return False


async def notify_user(user: User, alert: Alert) -> bool:
    """Envia push para um utilizador com base num alerta."""
    if not user.push_token:
        return False

    emoji = {"urgent": "🚨", "warning": "⚠️", "info": "ℹ️"}.get(alert.level, "")

    return await send_push(
        push_token=user.push_token,
        title=f"{emoji} {alert.title}",
        body=alert.message,
        level=alert.level,
        data={"alertId": str(alert.id), "processId": alert.process_id},
    )


async def broadcast_daily_alerts(user_ids: Optional[List[str]] = None) -> int:
    """
    Chamado pelo cron job diário.
    Envia push para todos os utilizadores com alertas não lidos.
    """
    from app.models.alert import Alert

    query = Alert.find(Alert.read == False)
    if user_ids:
        query = query.find({"user_id": {"$in": user_ids}})

    unread_alerts = await query.to_list()

    sent = 0
    processed_users = set()

    for alert in unread_alerts:
        if alert.user_id in processed_users:
            continue  # 1 push por utilizador por ciclo

        user = await User.find_one(User.email == alert.user_id)  # user_id = email
        if user and user.push_token:
            ok = await notify_user(user, alert)
            if ok:
                sent += 1
                processed_users.add(alert.user_id)

    return sent
