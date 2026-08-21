from typing import Any

from app.services.opspilot import OpsPilotAgent
from app.services.guarded_executor import GuardedExecutor
from app.services.trace_service import TraceService


class TestRunner:

    def __init__(
        self,
        agent: OpsPilotAgent,
        executor: GuardedExecutor,
        trace_service: TraceService,
    ):
        self.agent = agent
        self.executor = executor
        self.trace_service = trace_service

    def run_test(
        self,
        scenario: str,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> dict[str, Any]:

        result = self.executor.execute(
            tool_name=tool_name,
            arguments=arguments,
        )

        trace = self.trace_service.record(
            agent=self.agent.name,
            tool=tool_name,
            arguments=arguments,
            result=result,
        )

        return {
            "scenario": scenario,
            "agent": self.agent.name,
            "tool": tool_name,
            "result": result,
            "trace": trace,
            "status": "completed",
        }