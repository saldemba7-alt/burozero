from datetime import datetime
from app.models.alert import Alert, AlertLevel
from app.models.process import Process, StatusType


async def check_and_create_alerts(process: Process) -> None:
    """
    Chamado após criar/atualizar um processo.
    Gera alertas automáticos baseados em:
    - Prazo a menos de 7 dias
    - Prazo a menos de 2 dias
    - Processo parado há mais de 30 dias
    """
    alerts_to_create = []
    now = datetime.utcnow()

    # 1. Deadline warnings
    if process.deadline:
        days_left = (process.deadline - now).days

        if days_left <= 2:
            alerts_to_create.append(Alert(
                user_id=process.user_id,
                process_id=str(process.id),
                level=AlertLevel.URGENT,
                title=f"🚨 Prazo amanhã — {process.title}",
                message=f"O prazo de entrega termina em {days_left} dia(s). Age agora.",
            ))
        elif days_left <= 7:
            alerts_to_create.append(Alert(
                user_id=process.user_id,
                process_id=str(process.id),
                level=AlertLevel.WARNING,
                title=f"⚠️ Prazo em {days_left} dias — {process.title}",
                message=f"Faltam {days_left} dias para o prazo de {process.entity}. Verifica o estado.",
            ))

    # 2. Stalled process (no update in 30+ days)
    days_stalled = (now - process.last_update).days
    if days_stalled >= 30 and process.status not in (StatusType.CONCLUIDO,):
        alerts_to_create.append(Alert(
            user_id=process.user_id,
            process_id=str(process.id),
            level=AlertLevel.WARNING,
            title=f"⏸ Processo parado — {process.title}",
            message=f"Este processo está sem atualização há {days_stalled} dias. Verifica o estado em {process.entity}.",
        ))

    for alert in alerts_to_create:
        await alert.insert()


async def run_daily_check(user_id: str = "all") -> int:
    """
    Corre diariamente (cron job / APScheduler).
    Verifica todos os processos activos e gera alertas necessários.
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
        after  = await Alert.find(Alert.process_id == str(process.id)).count()
        count += (after - before)

    return count
