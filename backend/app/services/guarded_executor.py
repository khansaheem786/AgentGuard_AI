from typing import Any

from app.services.policy_engine import PolicyEngine
from app.services.tool_executor import ToolExecutor


class GuardedExecutor:

    def __init__(
        self,
        executor: ToolExecutor,
        policy_engine: PolicyEngine,
    ):
        self.executor = executor
        self.policy_engine = policy_engine

    def execute(
        self,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> dict[str, Any]:

        policy = self.policy_engine.validate(
            tool_name=tool_name,
            arguments=arguments,
        )

        # -----------------------------------------
        # BLOCK unsafe operation
        # -----------------------------------------

        if not policy["allowed"]:

            return {
                "status": "BLOCKED",
                "tool": tool_name,
                "arguments": arguments,
                "policy": policy,
            }

        # -----------------------------------------
        # Execute only if policy allows it
        # -----------------------------------------

        result = self.executor.execute(
            tool_name=tool_name,
            arguments=arguments,
        )

        return {
            "status": "ALLOWED",
            "tool": tool_name,
            "arguments": arguments,
            "policy": policy,
            "result": result,
        }