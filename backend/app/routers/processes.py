from fastapi import APIRouter, HTTPException, Depends
from app.services.token_service import get_current_user
from app.models.user import User
from typing import List
from datetime import datetime
from app.models.process import (
    Process, ProcessCreate, ProcessUpdate, ProcessOut,
    StatusType, PROCESS_TEMPLATES
)
from app.services.alert_service import check_and_create_alerts

router = APIRouter()

# ── Helper ────────────────────────────────────────────────────
def to_out(p: Process) -> ProcessOut:
    return ProcessOut(
        id=str(p.id),
        title=p.title,
        entity=p.entity,
        status=p.status,
        reference=p.reference,
        started_at=p.started_at,
        deadline=p.deadline,
        last_update=p.last_update,
        steps=p.steps,
        days_since_update=p.days_since_update,
        days_until_deadline=p.days_until_deadline,
    )


# ── Routes ────────────────────────────────────────────────────

@router.get("/", response_model=List[ProcessOut])
async def list_processes(current_user: User = Depends(get_current_user)):
    user_id = str(current_user.id)
    processes = await Process.find(Process.user_id == user_id).to_list()
    return [to_out(p) for p in processes]


@router.post("/", response_model=ProcessOut, status_code=201)
async def create_process(data: ProcessCreate, current_user: User = Depends(get_current_user)):
    user_id = str(current_user.id)
    # Load default steps from template if available
    template_steps = PROCESS_TEMPLATES.get(data.title, [])

    process = Process(
        user_id=user_id,
        title=data.title,
        entity=data.entity,
        reference=data.reference,
        deadline=data.deadline,
        notes=data.notes,
        steps=template_steps,
    )
    await process.insert()

    # Auto-generate first alert if deadline is close
    await check_and_create_alerts(process)

    return to_out(process)


@router.get("/{process_id}", response_model=ProcessOut)
async def get_process(process_id: str):
    process = await Process.get(process_id)
    if not process:
        raise HTTPException(404, "Processo não encontrado")
    return to_out(process)


@router.patch("/{process_id}", response_model=ProcessOut)
async def update_process(process_id: str, data: ProcessUpdate):
    process = await Process.get(process_id)
    if not process:
        raise HTTPException(404, "Processo não encontrado")

    update_data = data.dict(exclude_none=True)
    update_data["last_update"] = datetime.utcnow()

    await process.update({"$set": update_data})
    await process.sync()
    return to_out(process)


@router.patch("/{process_id}/steps/{step_order}/done")
async def mark_step_done(process_id: str, step_order: int):
    process = await Process.get(process_id)
    if not process:
        raise HTTPException(404, "Processo não encontrado")

    for step in process.steps:
        if step.order == step_order:
            step.done = True
            step.done_at = datetime.utcnow()

    process.last_update = datetime.utcnow()

    # Auto-advance status
    if all(s.done for s in process.steps):
        process.status = StatusType.CONCLUIDO

    await process.save()
    return to_out(process)


@router.delete("/{process_id}", status_code=204)
async def delete_process(process_id: str):
    process = await Process.get(process_id)
    if not process:
        raise HTTPException(404, "Processo não encontrado")
    await process.delete()
