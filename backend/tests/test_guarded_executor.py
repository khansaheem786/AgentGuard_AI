from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine
from app.services.tool_executor import ToolExecutor


def create_guarded_executor():
    return GuardedExecutor(
        executor=ToolExecutor(),
        policy_engine=PolicyEngine(),
    )


def test_valid_refund_is_allowed_and_executed():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "refund_order",
        {"order_id": "ORD-1024"},
    )

    assert result["status"] == "ALLOWED"
    assert result["policy"]["allowed"] is True
    assert result["result"]["status"] == "SIMULATED"
    assert result["result"]["order_id"] == "ORD-1024"


def test_broad_refund_is_blocked_before_execution():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "refund_order",
        {"order_id": "ALL_ORDERS"},
    )

    assert result["status"] == "BLOCKED"
    assert result["policy"]["allowed"] is False
    assert result["policy"]["reason"] == "BROAD_RESOURCE"
    assert "result" not in result


def test_invalid_identifier_is_blocked_before_execution():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "refund_order",
        {"order_id": "INVALID_RESOURCE"},
    )

    assert result["status"] == "BLOCKED"
    assert result["policy"]["reason"] == "INVALID_IDENTIFIER"
    assert "result" not in result


def test_null_identifier_is_blocked_before_execution():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "refund_order",
        {"order_id": None},
    )

    assert result["status"] == "BLOCKED"
    assert result["policy"]["reason"] == "NULL_IDENTIFIER"
    assert "result" not in result


def test_whitespace_identifier_is_blocked_before_execution():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "refund_order",
        {"order_id": " ORD-1024 "},
    )

    assert result["status"] == "BLOCKED"
    assert result["policy"]["reason"] == "WHITESPACE_MANIPULATION"
    assert "result" not in result


def test_sensitive_file_deletion_is_blocked():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "delete_file",
        {"file_path": "/sensitive/customers.json"},
    )

    assert result["status"] == "BLOCKED"
    assert result["policy"]["reason"] == "SENSITIVE_FILE_OPERATION"
    assert result["policy"]["severity"] == "CRITICAL"
    assert "result" not in result


def test_normal_customer_lookup_is_allowed():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "get_customer",
        {"customer_id": "CUS-001"},
    )

    assert result["status"] == "ALLOWED"
    assert result["policy"]["allowed"] is True
    assert result["result"]["status"] == "success"
    assert result["result"]["customer_id"] == "CUS-001"


def test_normal_order_lookup_is_allowed():
    guarded = create_guarded_executor()

    result = guarded.execute(
        "get_order",
        {"order_id": "ORD-1024"},
    )

    assert result["status"] == "ALLOWED"
    assert result["policy"]["allowed"] is True
    assert result["result"]["status"] == "success"
    assert result["result"]["order_id"] == "ORD-1024"