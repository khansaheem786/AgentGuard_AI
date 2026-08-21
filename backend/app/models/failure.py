from typing import Any

from pydantic import BaseModel


class FailureAnalysis(BaseModel):
    scenario_id: str
    scenario_name: str
    result: str
    failure_type: str | None = None
    severity: str
    explanation: str
    recommendation: str
    evidence: dict[str, Any]