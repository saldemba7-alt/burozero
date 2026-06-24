from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter()

class FiscalEvent(BaseModel):
    date:   str
    title:  str
    entity: str
    type:   str   # "deadline" | "info"

# Calendário fiscal Portugal 2026 — pré-carregado
FISCAL_CALENDAR_2026: List[FiscalEvent] = [
    # IRS
    FiscalEvent(date="2026-06-30", title="IRS — Prazo entrega Modelo 3",           entity="AT",   type="deadline"),
    # IVA (trimestral)
    FiscalEvent(date="2026-05-15", title="IVA — Declaração Q1 (Jan–Mar)",           entity="AT",   type="deadline"),
    FiscalEvent(date="2026-08-15", title="IVA — Declaração Q2 (Abr–Jun)",           entity="AT",   type="deadline"),
    FiscalEvent(date="2026-11-15", title="IVA — Declaração Q3 (Jul–Set)",           entity="AT",   type="deadline"),
    FiscalEvent(date="2027-02-15", title="IVA — Declaração Q4 (Out–Dez)",           entity="AT",   type="deadline"),
    # IRC
    FiscalEvent(date="2026-05-31", title="IRC — Pagamento especial por conta",      entity="AT",   type="deadline"),
    FiscalEvent(date="2026-07-31", title="IRC — Modelo 22 (exercício 2025)",        entity="AT",   type="deadline"),
    # Seg. Social
    FiscalEvent(date="2026-04-20", title="SS — Declaração remunerações Mar 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-05-20", title="SS — Declaração remunerações Abr 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-06-20", title="SS — Declaração remunerações Mai 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-07-20", title="SS — Declaração remunerações Jun 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-08-20", title="SS — Declaração remunerações Jul 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-09-20", title="SS — Declaração remunerações Ago 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-10-20", title="SS — Declaração remunerações Set 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-11-20", title="SS — Declaração remunerações Out 2026",   entity="SS",   type="deadline"),
    FiscalEvent(date="2026-12-20", title="SS — Declaração remunerações Nov 2026",   entity="SS",   type="deadline"),
    # IMI
    FiscalEvent(date="2026-04-30", title="IMI — 1.ª prestação (colecta > €500)",    entity="AT",   type="deadline"),
    FiscalEvent(date="2026-07-31", title="IMI — 2.ª prestação",                     entity="AT",   type="deadline"),
    FiscalEvent(date="2026-11-30", title="IMI — 3.ª prestação / pagamento único",   entity="AT",   type="deadline"),
]

@router.get("/", response_model=List[FiscalEvent])
async def get_fiscal_calendar(year: int = 2026, month: int = None):
    events = FISCAL_CALENDAR_2026
    if month:
        events = [e for e in events if e.date.startswith(f"{year}-{month:02d}")]
    return sorted(events, key=lambda e: e.date)

@router.get("/upcoming", response_model=List[FiscalEvent])
async def get_upcoming(days: int = 30):
    today = date.today()
    from datetime import timedelta
    limit = today + timedelta(days=days)
    return [
        e for e in FISCAL_CALENDAR_2026
        if today <= date.fromisoformat(e.date) <= limit
    ]
