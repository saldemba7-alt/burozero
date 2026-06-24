from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.alert_service import run_daily_check
from app.services.push_service import broadcast_daily_alerts

scheduler = AsyncIOScheduler(timezone="Europe/Lisbon")


def setup_scheduler():
    # Todos os dias às 09:00 Lisboa — verifica prazos e envia pushs
    scheduler.add_job(
        daily_job,
        CronTrigger(hour=9, minute=0, timezone="Europe/Lisbon"),
        id="daily_check",
        replace_existing=True,
    )
    scheduler.start()
    print("✅ Scheduler iniciado — check diário às 09:00 Lisboa")


async def daily_job():
    print("⏰ A correr check diário de alertas...")
    created = await run_daily_check()
    print(f"   {created} alertas criados")

    sent = await broadcast_daily_alerts()
    print(f"   {sent} push notifications enviadas")
