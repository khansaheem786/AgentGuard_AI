from datetime import datetime, timezone
from typing import Any

from app.models.trace import ToolTrace


class TraceService:

    def __init__(self):
        self.traces: list[ToolTrace] = []

    def record(
        self,
        agent: str,
        tool: str,
        arguments: dict[str, Any],
        result: dict[str, Any],
        status: str = "completed",
    ) -> ToolTrace:

        trace = ToolTrace(
            trace_id=f"TRC-{len(self.traces) + 1:04d}",
            agent=agent,
            tool=tool,
            arguments=arguments,
            result=result,
            status=status,
            timestamp=datetime.now(timezone.utc),
        )

        self.traces.append(trace)

        return trace

    def get_all(self) -> list[ToolTrace]:
        return self.traces