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
        # Order lookup security policy
        # -----------------------------------------

        if tool_name == "get_order":

            if "order_id" not in arguments:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "MISSING_REQUIRED_ARGUMENT",
                    "message": "Order lookup requires a valid order_id.",
                    "severity": "HIGH",
                }

            order_id = arguments.get("order_id")

            if order_id is None:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "NULL_IDENTIFIER",
                    "message": "Null order identifiers are not allowed.",
                    "severity": "HIGH",
                }

            if not isinstance(order_id, str):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_IDENTIFIER_TYPE",
                    "message": "Order identifier must be a string.",
                    "severity": "HIGH",
                }

            if not order_id:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "EMPTY_IDENTIFIER",
                    "message": "Empty order identifiers are not allowed.",
                    "severity": "MEDIUM",
                }

            if order_id != order_id.strip():
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "WHITESPACE_MANIPULATION",
                    "message": "Order identifiers must not contain leading or trailing whitespace.",
                    "severity": "MEDIUM",
                }

            if order_id == "ALL_ORDERS":
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "BROAD_RESOURCE",
                    "message": "Order lookup cannot target all orders.",
                    "severity": "CRITICAL",
                }

            if not order_id.startswith("ORD-"):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_IDENTIFIER",
                    "message": "Invalid order identifier.",
                    "severity": "HIGH",
                }

                    # -----------------------------------------
        # Customer lookup security policy
        # -----------------------------------------

        if tool_name == "get_customer":

            if "customer_id" not in arguments:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "MISSING_REQUIRED_ARGUMENT",
                    "message": "Customer lookup requires a valid customer_id.",
                    "severity": "HIGH",
                }

            customer_id = arguments.get("customer_id")

            if customer_id is None:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "NULL_IDENTIFIER",
                    "message": "Null customer identifiers are not allowed.",
                    "severity": "HIGH",
                }

            if not isinstance(customer_id, str):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_IDENTIFIER_TYPE",
                    "message": "Customer identifier must be a string.",
                    "severity": "HIGH",
                }

            if not customer_id:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "EMPTY_IDENTIFIER",
                    "message": "Empty customer identifiers are not allowed.",
                    "severity": "MEDIUM",
                }

            if customer_id != customer_id.strip():
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "WHITESPACE_MANIPULATION",
                    "message": "Customer identifiers must not contain leading or trailing whitespace.",
                    "severity": "MEDIUM",
                }

            if customer_id == "ALL_CUSTOMERS":
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "BROAD_RESOURCE",
                    "message": "Customer lookup cannot target all customers.",
                    "severity": "CRITICAL",
                }

            if not customer_id.startswith("CUS-"):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_IDENTIFIER",
                    "message": "Invalid customer identifier.",
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
            if file_path is None:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "NULL_FILE_PATH",
                    "message": "Null file paths are not allowed.",
                    "severity": "CRITICAL",
                }

            if not isinstance(file_path, str):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_FILE_PATH_TYPE",
                    "message": "File path must be a string.",
                    "severity": "HIGH",
                }

            if not file_path:
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_FILE_PATH",
                    "message": "A valid file path is required.",
                    "severity": "CRITICAL",
                }

            if file_path != file_path.strip():
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "WHITESPACE_MANIPULATION",
                    "message": "File paths must not contain leading or trailing whitespace.",
                    "severity": "MEDIUM",
                }

            if file_path == "INVALID_RESOURCE":
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": "INVALID_FILE_PATH",
                    "message": "Invalid file path.",
                    "severity": "HIGH",
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