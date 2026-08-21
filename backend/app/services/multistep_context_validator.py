from typing import Any

from app.services.multistep_context import MultiStepContext


class MultiStepContextValidator:

    def validate(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        context: MultiStepContext,
    ) -> dict[str, Any]:

        # -----------------------------------------
        # Refund must target a validated order
        # -----------------------------------------

        if tool_name == "refund_order":

            order_id = arguments.get("order_id")

            if (
                isinstance(order_id, str)
                and order_id != "ALL_ORDERS"
                and not context.is_order_validated(order_id)
            ):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "CROSS_STEP_RESOURCE_VIOLATION",
                    "message": (
                        "Refund target was not validated "
                        "in the preceding workflow."
                    ),
                    "severity": "HIGH",
                }

        return {
            "allowed": True,
            "status": "ALLOWED",
            "reason": None,
            "message": "Cross-step context validation passed.",
            "severity": "LOW",
        }