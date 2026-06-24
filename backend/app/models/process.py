from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EntityType(str, Enum):
    AT         = "AT"          # Finanças
    SS         = "SS"          # Segurança Social
    AIMA       = "AIMA"
    IMT        = "IMT"
    IMPIC      = "IMPIC"
    CAMARA     = "CAMARA"
    OUTRO      = "OUTRO"


class StatusType(str, Enum):
    EM_CURSO   = "em_curso"
    PENDENTE   = "pendente"
    PARADO     = "parado"
    CONCLUIDO  = "concluido"
    URGENTE    = "urgente"


class ProcessStep(BaseModel):
    order:      int
    name:       str
    detail:     str
    done:       bool = False
    done_at:    Optional[datetime] = None


class Process(Document):
    user_id:       str
    title:         str
    entity:        EntityType
    status:        StatusType = StatusType.PENDENTE
    reference:     Optional[str] = None          # ex: "AR/2024/0823"
    started_at:    datetime = Field(default_factory=datetime.utcnow)
    deadline:      Optional[datetime] = None
    last_update:   datetime = Field(default_factory=datetime.utcnow)
    steps:         List[ProcessStep] = []
    notes:         Optional[str] = None

    class Settings:
        name = "processes"

    @property
    def days_since_update(self) -> int:
        return (datetime.utcnow() - self.last_update).days

    @property
    def days_until_deadline(self) -> Optional[int]:
        if not self.deadline:
            return None
        return (self.deadline - datetime.utcnow()).days


# ── Pydantic schemas ──────────────────────────────────────────

class ProcessCreate(BaseModel):
    title:      str
    entity:     EntityType
    reference:  Optional[str] = None
    deadline:   Optional[datetime] = None
    notes:      Optional[str] = None

class ProcessUpdate(BaseModel):
    status:     Optional[StatusType] = None
    deadline:   Optional[datetime] = None
    notes:      Optional[str] = None

class ProcessOut(BaseModel):
    id:               str
    title:            str
    entity:           EntityType
    status:           StatusType
    reference:        Optional[str]
    started_at:       datetime
    deadline:         Optional[datetime]
    last_update:      datetime
    steps:            List[ProcessStep]
    days_since_update: int
    days_until_deadline: Optional[int]

    class Config:
        from_attributes = True
