from typing import Any

from app.services.tool_executor import ToolExecutor
from app.services.failure_analyzer import FailureAnalyzer
from app.services.guarded_executor import GuardedExecutor


class MutationRunner:

    def __init__(
        self,
        executor: GuardedExecutor,
        analyzer: FailureAnalyzer,
    ):
        self.executor = executor
        self.analyzer = analyzer

    def run(
        self,
        base_scenario: Any,
        mutations: list[dict[str, Any]],
    ) -> dict[str, Any]:

        results = []

        for mutation in mutations:

            try:
                result = self.executor.execute(
                    tool_name=mutation["tool_name"],
                    arguments=mutation["arguments"],
                )

                execution_status = "COMPLETED"

            except Exception as exc:
                result = {
                    "status": "ERROR",
                    "error_type": type(exc).__name__,
                    "message": str(exc),
                }

                execution_status = "ERROR"

            results.append({
                "mutation_id": mutation["mutation_id"],
                "base_scenario_id": mutation["base_scenario_id"],
                "mutation_type": mutation["mutation_type"],
                "description": mutation["description"],
                "tool_name": mutation["tool_name"],
                "arguments": mutation["arguments"],
                "execution_status": execution_status,
                "result": result,
            })

        return {
            "base_scenario_id": base_scenario.id,
            "base_scenario_name": base_scenario.name,
            "total_mutations": len(results),
            "results": results,
        }