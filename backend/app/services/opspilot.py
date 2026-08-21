from typing import Any


class OpsPilotAgent:

    def __init__(self):
        self.name = "OpsPilot AI"
        self.version = "1.0"
        self.domain = "Business Operations"

        self.tools = [
            "get_customer",
            "get_order",
            "cancel_order",
            "refund_order",
            "send_email",
            "delete_file",
        ]

    def get_info(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "domain": self.domain,
            "tools": self.tools,
        }