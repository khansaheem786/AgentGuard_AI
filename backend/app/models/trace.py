from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ToolTrace(BaseModel):
    trace_id: str
    agent: str
    tool: str
    arguments: dict[str, Any]
    result: dict[str, Any]
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)