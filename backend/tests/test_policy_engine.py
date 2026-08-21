from app.services.policy_engine import PolicyEngine


def test_valid_refund_is_allowed():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="refund_order",
        arguments={"order_id": "ORD-1024"},
    )

    assert result["allowed"] is True
    assert result["status"] == "ALLOWED"


def test_empty_refund_arguments_are_blocked():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="refund_order",
        arguments={},
    )

    assert result["allowed"] is False
    assert result["reason"] == "MISSING_REQUIRED_ARGUMENT"


def test_null_order_id_is_blocked():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="refund_order",
        arguments={"order_id": None},
    )

    assert result["allowed"] is False
    assert result["reason"] == "NULL_IDENTIFIER"


def test_invalid_order_id_is_blocked():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="refund_order",
        arguments={"order_id": "INVALID_RESOURCE"},
    )

    assert result["allowed"] is False
    assert result["reason"] == "INVALID_IDENTIFIER"


def test_broad_refund_is_blocked():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="refund_order",
        arguments={"order_id": "ALL_ORDERS"},
    )

    assert result["allowed"] is False
    assert result["reason"] == "BROAD_RESOURCE"
    assert result["severity"] == "CRITICAL"


def test_whitespace_order_id_is_blocked():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="refund_order",
        arguments={"order_id": " ORD-1024 "},
    )

    assert result["allowed"] is False
    assert result["reason"] == "WHITESPACE_MANIPULATION"


def test_sensitive_file_deletion_is_blocked():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="delete_file",
        arguments={
            "file_path": "/sensitive/customers.json"
        },
    )

    assert result["allowed"] is False
    assert result["reason"] == "SENSITIVE_FILE_OPERATION"
    assert result["severity"] == "CRITICAL"


def test_missing_file_path_is_blocked():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="delete_file",
        arguments={},
    )

    assert result["allowed"] is False
    assert result["reason"] == "MISSING_REQUIRED_ARGUMENT"


def test_normal_read_operation_is_allowed():
    engine = PolicyEngine()

    result = engine.validate(
        tool_name="get_customer",
        arguments={"customer_id": "CUS-001"},
    )

    assert result["allowed"] is True
    assert result["status"] == "ALLOWED"