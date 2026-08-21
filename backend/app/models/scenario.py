from typing import Any

from pydantic import BaseModel


class TestScenario(BaseModel):
    id: str
    name: str
    category: str
    description: str
    tool_name: str
    arguments: dict[str, Any]
    expected_behavior: str
    severity: str