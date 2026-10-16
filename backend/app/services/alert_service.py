from datetime import datetime, timezone
from app.models.alert import Alert, AlertLevel
from app.models.process import Process, StatusType


def _utc(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


async def _already_alerted(process_id: str, kind: str) -> bool:
    """
    Evita repetir o mesmo alerta todos os dias.
    Só cria um novo alerta se não existir um alerta POR LER do mesmo tipo
    para o mesmo processo. Quando o utilizador lê o alerta, o próximo
    escalão (ex.: de 7 dias para 2 dias) volta a avisar.
    """
    existing = await Alert.find(
        Alert.process_id == process_id,
        Alert.read == False,  # noqa: E712
        {"title": {"$regex": f"^{kind}"}},
    ).count()
    return existing > 0


async def check_and_create_alerts(process: Process) -> None:
    """
    Chamado após criar um processo e no check diário.
    Gera alertas automáticos (sem repetir alertas por ler):
    - Prazo ultrapassado
    - Prazo hoje / a 2 dias ou menos
    - Prazo a 7 dias ou menos
    - Processo parado há mais de 30 dias
    """
    if process.status == StatusType.CONCLUIDO:
        return

    pid = str(process.id)
    now = datetime.now(timezone.utc)
    alerts_to_create = []

    # 1. Prazos (contados em dias de calendário)
    if process.deadline:
        days_left = (_utc(process.deadline).date() - now.date()).days

        if days_left < 0:
            kind = "⛔"
            title = f"{kind} Prazo ultrapassado — {process.title}"
            n = abs(days_left)
            message = f"O prazo terminou há {n} dia{'s' if n != 1 else ''}. Confirma a situação em {process.entity.value}."
            level = AlertLevel.URGENT
        elif days_left <= 2:
            kind = "🚨"
            quando = {0: "hoje", 1: "amanhã"}.get(days_left, f"em {days_left} dias")
            title = f"{kind} Prazo {quando} — {process.title}"
            message = f"O prazo termina {quando}. Age agora."
            level = AlertLevel.URGENT
        elif days_left <= 7:
            kind = "⚠️"
            title = f"{kind} Prazo em {days_left} dias — {process.title}"
            message = f"Faltam {days_left} dias para o prazo de {process.entity.value}. Verifica o estado."
            level = AlertLevel.WARNING
        else:
            kind = None

        if kind and not await _already_alerted(pid, kind):
            alerts_to_create.append(Alert(
                user_id=process.user_id, process_id=pid,
                level=level, title=title, message=message,
            ))

    # 2. Processo parado (sem atualização há 30+ dias)
    days_stalled = (now - _utc(process.last_update)).days
    if days_stalled >= 30 and not await _already_alerted(pid, "⏸"):
        alerts_to_create.append(Alert(
            user_id=process.user_id, process_id=pid,
            level=AlertLevel.WARNING,
            title=f"⏸ Processo parado — {process.title}",
            message=f"Este processo está sem atualização há {days_stalled} dias. Verifica o estado em {process.entity.value}.",
        ))

    for alert in alerts_to_create:
        await alert.insert()


async def run_daily_check(user_id: str = "all") -> int:
    """
    Corre diariamente (APScheduler).
    Verifica todos os processos activos e gera os alertas necessários.
    Retorna o número de alertas criados.
    """
    query = Process.find() if user_id == "all" else Process.find(Process.user_id == user_id)
    processes = await query.to_list()

    count = 0
    for process in processes:
        if process.status == StatusType.CONCLUIDO:
            continue
        before = await Alert.find(Alert.process_id == str(process.id)).count()
        await check_and_create_alerts(process)
        after = await Alert.find(Alert.process_id == str(process.id)).count()
        count += (after - before)

    return count
