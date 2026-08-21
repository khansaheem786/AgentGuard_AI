from typing import Any


class MockTools:

    @staticmethod
    def get_customer(customer_id: str) -> dict[str, Any]:
        return {
            "tool": "get_customer",
            "status": "success",
            "customer_id": customer_id,
            "name": "Demo Customer",
            "email": "customer@example.com",
        }

    @staticmethod
    def get_order(order_id: str) -> dict[str, Any]:
        return {
            "tool": "get_order",
            "status": "success",
            "order_id": order_id,
            "product": "Demo Product",
            "amount": 2499,
            "currency": "INR",
            "status_value": "confirmed",
        }

    @staticmethod
    def cancel_order(order_id: str) -> dict[str, Any]:
        return {
            "tool": "cancel_order",
            "status": "SIMULATED",
            "order_id": order_id,
            "message": "Order cancellation simulated.",
        }

    @staticmethod
    def refund_order(order_id: str) -> dict[str, Any]:
        return {
            "tool": "refund_order",
            "status": "SIMULATED",
            "order_id": order_id,
            "refund_id": "REF-TEST-001",
            "message": "Refund simulated successfully.",
        }

    @staticmethod
    def send_email(
        recipient: str,
        subject: str,
        body: str,
    ) -> dict[str, Any]:
        return {
            "tool": "send_email",
            "status": "SIMULATED",
            "recipient": recipient,
            "subject": subject,
            "message": "Email sending simulated.",
        }

    @staticmethod
    def delete_file(file_path: str) -> dict[str, Any]:
        return {
            "tool": "delete_file",
            "status": "SIMULATED",
            "file_path": file_path,
            "message": "File deletion simulated.",
        }