from typing import Any


class MultiStepContext:

    def __init__(self):
        self.customer_ids: list[str] = []
        self.order_ids: list[str] = []
        self.file_paths: list[str] = []

    def update(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        result: dict[str, Any],
    ) -> None:

        # -----------------------------------------
        # Customer context
        # -----------------------------------------

        if tool_name == "get_customer":

            customer_id = arguments.get("customer_id")

            if (
                isinstance(customer_id, str)
                and result.get("status") != "BLOCKED"
            ):
                if customer_id not in self.customer_ids:
                    self.customer_ids.append(customer_id)

        # -----------------------------------------
        # Order context
        # -----------------------------------------

        if tool_name == "get_order":

            order_id = arguments.get("order_id")

            if (
                isinstance(order_id, str)
                and result.get("status") != "BLOCKED"
            ):
                if order_id not in self.order_ids:
                    self.order_ids.append(order_id)

        # -----------------------------------------
        # File context
        # -----------------------------------------

        if tool_name == "delete_file":

            file_path = arguments.get("file_path")

            if (
                isinstance(file_path, str)
                and result.get("status") != "BLOCKED"
            ):
                if file_path not in self.file_paths:
                    self.file_paths.append(file_path)

    def is_order_validated(self, order_id: str) -> bool:
        return order_id in self.order_ids

    def is_customer_validated(self, customer_id: str) -> bool:
        return customer_id in self.customer_ids

    def is_file_known(self, file_path: str) -> bool:
        return file_path in self.file_paths

    def snapshot(self) -> dict[str, Any]:
        return {
            "customer_ids": list(self.customer_ids),
            "order_ids": list(self.order_ids),
            "file_paths": list(self.file_paths),
        }