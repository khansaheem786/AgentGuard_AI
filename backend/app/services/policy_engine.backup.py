from typing import Any


class PolicyEngine:

    def validate(
        self,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> dict[str, Any]:

        # -----------------------------------------
        # Unknown / missing arguments
        # -----------------------------------------

        if not isinstance(arguments, dict):
            return {
                "allowed": False,
                "status": "BLOCKED",
                "reason": "INVALID_ARGUMENTS",
                "message": "Tool arguments must be a dictionary.",
                "severity": "HIGH",
            }

        # -----------------------------------------
        # Refund security policy
        # -----------------------------------------

        if tool_name == "refund_order":

            if "order_id" not in arguments:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "MISSING_REQUIRED_ARGUMENT",
                    "message": "Refund requires a valid order_id.",
                    "severity": "HIGH",
                }

            order_id = arguments.get("order_id")

            # Null
            if order_id is None:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "NULL_IDENTIFIER",
                    "message": "Null order identifiers are not allowed.",
                    "severity": "HIGH",
                }

            # Must be string
            if not isinstance(order_id, str):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_IDENTIFIER_TYPE",
                    "message": "Order identifier must be a string.",
                    "severity": "HIGH",
                }

            # Empty string
            if not order_id:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "EMPTY_IDENTIFIER",
                    "message": "Empty order identifiers are not allowed.",
                    "severity": "MEDIUM",
                }

            # Whitespace manipulation
            if order_id != order_id.strip():
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "WHITESPACE_MANIPULATION",
                    "message": "Order identifiers must not contain leading or trailing whitespace.",
                    "severity": "MEDIUM",
                }

            # Broad resource
            if order_id == "ALL_ORDERS":
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "BROAD_RESOURCE",
                    "message": "Refund operations cannot target all orders.",
                    "severity": "CRITICAL",
                }

            # Strict order identifier format
            if not order_id.startswith("ORD-"):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_IDENTIFIER",
                    "message": "Invalid order identifier.",
                    "severity": "HIGH",
                }

        # -----------------------------------------
        # File deletion security policy
        # -----------------------------------------

        if tool_name == "delete_file":

            if "file_path" not in arguments:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "MISSING_REQUIRED_ARGUMENT",
                    "message": "File deletion requires a file path.",
                    "severity": "CRITICAL",
                }

            file_path = arguments.get("file_path")

            if not file_path:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_FILE_PATH",
                    "message": "A valid file path is required.",
                    "severity": "CRITICAL",
                }

            if str(file_path).startswith("/sensitive/"):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "SENSITIVE_FILE_OPERATION",
                    "message": "Deletion of sensitive files is prohibited.",
                    "severity": "CRITICAL",
                }

        # -----------------------------------------
        # Default: allow
        # -----------------------------------------

        return {
            "allowed": True,
            "status": "ALLOWED",
            "reason": None,
            "message": "Tool execution allowed.",
            "severity": "LOW",
        }