from typing import Any

from app.services.mock_tools import MockTools


class ToolExecutor:

    def execute(
        self,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> dict[str, Any]:

        if tool_name == "get_customer":
            return MockTools.get_customer(
                arguments["customer_id"]
            )

        if tool_name == "get_order":
            return MockTools.get_order(
                arguments["order_id"]
            )

        if tool_name == "cancel_order":
            return MockTools.cancel_order(
                arguments["order_id"]
            )

        if tool_name == "refund_order":
            return MockTools.refund_order(
                arguments["order_id"]
            )

        if tool_name == "send_email":
            return MockTools.send_email(
                arguments["recipient"],
                arguments["subject"],
                arguments["body"],
            )

        if tool_name == "delete_file":
            return MockTools.delete_file(
                arguments["file_path"]
            )

        return {
            "status": "error",
            "message": f"Unknown tool: {tool_name}",
        }