from copy import deepcopy
from typing import Any

from app.services.guarded_executor import GuardedExecutor
from app.services.multistep_context import MultiStepContext
from app.services.multistep_context_validator import (
    MultiStepContextValidator,
)


class ReplayExecutor:
    """
    Executes recorded tool calls inside a replay sandbox.

    The replay sandbox uses the existing GuardedExecutor and
    multi-step context validation so that security policies are
    evaluated again during sandbox replay.

    A single MultiStepContext is shared across all steps of a
    complete replay workflow.
    """

    def __init__(
        self,
        executor: GuardedExecutor,
    ):
        self.executor = executor

        self.context_validator = (
            MultiStepContextValidator()
        )

    # ======================================================
    # Execute one replay step
    # ======================================================

    def execute_step(
        self,
        step: dict[str, Any],
        context: MultiStepContext | None = None,
    ) -> dict[str, Any]:
        """
        Execute one recorded step inside the replay sandbox.

        `context` is optional for backward compatibility.

        When execute_step() is called directly:
            execute_step(step)

        a new context is created.

        During a complete replay:
            replay()
                |
                +-- execute_step(step, shared_context)

        the same context is passed through every step.
        """

        # --------------------------------------------------
        # Backward compatibility
        # --------------------------------------------------

        if context is None:
            context = MultiStepContext()

        tool = step["tool"]

        arguments = deepcopy(
            step.get("arguments", {})
        )

        # ==================================================
        # 1. CROSS-STEP CONTEXT VALIDATION
        # ==================================================

        context_validation = (
            self.context_validator.validate(
                tool_name=tool,
                arguments=arguments,
                context=context,
            )
        )

        # ==================================================
        # 2. CONTEXT VALIDATION BLOCK
        # ==================================================

        if not context_validation["allowed"]:

            # IMPORTANT:
            #
            # Keep the response structure consistent with
            # GuardedExecutor.
            #
            # This is required for deterministic fingerprint
            # comparison during sandbox replay.
            result = {
                "status": "BLOCKED",
                "tool": tool,
                "arguments": deepcopy(
                    arguments
                ),
                "policy": {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": (
                        context_validation[
                            "reason"
                        ]
                    ),
                    "message": (
                        context_validation[
                            "message"
                        ]
                    ),
                    "severity": (
                        context_validation[
                            "severity"
                        ]
                    ),
                },
            }

            return {
                "tool": tool,
                "arguments": arguments,
                "result": result,
                "context": context.snapshot(),
            }

        # ==================================================
        # 3. GUARDED TOOL EXECUTION
        # ==================================================

        result = self.executor.execute(
            tool_name=tool,
            arguments=deepcopy(arguments),
        )

        # ==================================================
        # 4. UPDATE MULTI-STEP CONTEXT
        # ==================================================

        context.update(
            tool_name=tool,
            arguments=arguments,
            result=result,
        )

        # ==================================================
        # 5. RETURN NORMALIZED RESULT
        # ==================================================

        return {
            "tool": tool,
            "arguments": arguments,
            "result": result,
            "context": context.snapshot(),
        }

    # ======================================================
    # Replay complete workflow
    # ======================================================

    def replay(
        self,
        steps: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Replay a complete workflow.

        One shared MultiStepContext is intentionally used
        for every step so cross-step authorization decisions
        can be reproduced.
        """

        replay_steps = []

        # --------------------------------------------------
        # Shared workflow context
        # --------------------------------------------------

        context = MultiStepContext()

        # ==================================================
        # Execute every recorded step
        # ==================================================

        for index, step in enumerate(
            steps,
            start=1,
        ):

            execution = self.execute_step(
                step=step,
                context=context,
            )

            replay_steps.append(
                {
                    "replay_step_id": index,

                    "original_step_id": (
                        step["step_id"]
                    ),

                    "original_trace_id": (
                        step.get("trace_id")
                    ),

                    "tool": execution[
                        "tool"
                    ],

                    "arguments": execution[
                        "arguments"
                    ],

                    "result": execution[
                        "result"
                    ],

                    "context": execution[
                        "context"
                    ],
                }
            )

        # ==================================================
        # Final replay response
        # ==================================================

        return {
            "total_steps": len(
                replay_steps
            ),

            "steps": replay_steps,

            "execution_mode": (
                "SANDBOX_REPLAY"
            ),

            "final_context": (
                context.snapshot()
            ),
        }