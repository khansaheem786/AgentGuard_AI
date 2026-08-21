from typing import Any

from fastapi import APIRouter

from app.services.opspilot import OpsPilotAgent
from app.services.tool_executor import ToolExecutor
from app.services.trace_service import TraceService
from app.services.test_runner import TestRunner


router = APIRouter()

agent = OpsPilotAgent()
executor = ToolExecutor()
trace_service = TraceService()

test_runner = TestRunner(
    agent=agent,
    executor=executor,
    trace_service=trace_service,
)


@router.post("/run")
def run_test(
    scenario: str,
    tool_name: str,
    arguments: dict[str, Any],
):
    return test_runner.run_test(
        scenario=scenario,
        tool_name=tool_name,
        arguments=arguments,
    )