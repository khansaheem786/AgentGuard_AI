from typing import Any

from pydantic import BaseModel


class MultiStep(BaseModel):
    step_id: int
    tool_name: str
    arguments: dict[str, Any]
    expected_behavior: str


class MultiStepScenario(BaseModel):
    id: str
    name: str
    category: str
    description: str
    severity: str
    steps: list[MultiStep]