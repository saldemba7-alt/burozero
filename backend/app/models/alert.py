from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AlertLevel(str, Enum):
    INFO    = "info"
    WARNING = "warning"
    URGENT  = "urgent"


class Alert(Document):
    user_id:     str
    process_id:  Optional[str] = None
    level:       AlertLevel
    title:       str
    message:     str
    read:        bool = False
    created_at:  datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "alerts"


class AlertOut(BaseModel):
    id:         str
    level:      AlertLevel
    title:      str
    message:    str
    read:       bool
    created_at: datetime
    process_id: Optional[str]
