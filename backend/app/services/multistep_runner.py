from typing import Any

from app.services.guarded_executor import GuardedExecutor
from app.services.trace_service import TraceService
from app.services.multistep_context import MultiStepContext
from app.services.multistep_context_validator import MultiStepContextValidator


class MultiStepRunner:

    def __init__(
        self,
        executor: GuardedExecutor,
        trace_service: TraceService | None = None,
        context_validator: MultiStepContextValidator | None = None,
    ):
        self.executor = executor
        self.trace_service = trace_service or TraceService()
        self.context_validator = (
            context_validator
            or MultiStepContextValidator()
        )

    def run(
        self,
        scenario_id: str,
        steps: list[Any],
    ) -> dict[str, Any]:

        step_results = []

        context = MultiStepContext()

        for step in steps:

            # -----------------------------------------
            # 1. Cross-step context validation
            # -----------------------------------------

            context_validation = self.context_validator.validate(
                tool_name=step.tool_name,
                arguments=step.arguments,
                context=context,
            )

            # -----------------------------------------
            # 2. Stop immediately if the workflow
            #    violates cross-step authorization
            # -----------------------------------------

            if not context_validation["allowed"]:

                result = {
                    "status": "BLOCKED",
                    "tool": step.tool_name,
                    "arguments": step.arguments,
                    "policy": context_validation,
                }

                execution_status = "blocked"

            else:

                # -----------------------------------------
                # 3. Normal security policy + execution
                # -----------------------------------------

                result = self.executor.execute(
                    tool_name=step.tool_name,
                    arguments=step.arguments,
                )

                execution_status = (
                    "blocked"
                    if result.get("status") == "BLOCKED"
                    else "completed"
                )

            # -----------------------------------------
            # 4. Record trace
            # -----------------------------------------

            trace = self.trace_service.record(
                agent="OpsPilot AI",
                tool=step.tool_name,
                arguments=step.arguments,
                result=result,
                status=execution_status,
            )

            # -----------------------------------------
            # 5. Update context only after a successful
            #    execution
            # -----------------------------------------

            context.update(
                tool_name=step.tool_name,
                arguments=step.arguments,
                result=result,
            )

            # -----------------------------------------
            # 6. Store step result
            # -----------------------------------------

            step_results.append({
                "step_id": step.step_id,
                "trace_id": trace.trace_id,
                "tool": step.tool_name,
                "arguments": step.arguments,
                "expected_behavior": step.expected_behavior,
                "execution_status": execution_status,
                "context_validation": context_validation,
                "result": result,
                "context": context.snapshot(),
            })

        return {
            "scenario_id": scenario_id,
            "total_steps": len(step_results),
            "steps": step_results,
            "status": "completed",
            "context": context.snapshot(),
        }