from app.services.replay_engine import ReplayEngine


def test_replay_matches_original_trace():

    engine = ReplayEngine()

    original_steps = [
        {
            "step_id": 1,
            "trace_id": "TRACE-001",
            "tool": "get_customer",
            "arguments": {
                "customer_id": "CUS-001",
            },
            "result": {
                "status": "SUCCESS",
                "customer_id": "CUS-001",
            },
        },
        {
            "step_id": 2,
            "trace_id": "TRACE-002",
            "tool": "get_order",
            "arguments": {
                "order_id": "ORD-1024",
            },
            "result": {
                "status": "SUCCESS",
                "order_id": "ORD-1024",
            },
        },
    ]

    result = engine.replay(
        scenario_id="TEST-001",
        original_steps=original_steps,
    )

    assert result["scenario_id"] == "TEST-001"
    assert result["replay_status"] == "REPLAY_SUCCESS"

    assert result["total_steps"] == 2
    assert result["matched_steps"] == 2
    assert result["diverged_steps"] == 0

    assert result["determinism_score"] == 100.0


def test_replay_empty_trace():

    engine = ReplayEngine()

    result = engine.replay(
        scenario_id="TEST-EMPTY",
        original_steps=[],
    )

    assert result["total_steps"] == 0
    assert result["matched_steps"] == 0
    assert result["diverged_steps"] == 0

    assert result["replay_status"] == "REPLAY_SUCCESS"
    assert result["determinism_score"] == 100.0


def test_replay_preserves_trace_information():

    engine = ReplayEngine()

    original_steps = [
        {
            "step_id": 1,
            "trace_id": "TRACE-ABC",
            "tool": "refund_order",
            "arguments": {
                "order_id": "ORD-1024",
            },
            "result": {
                "status": "BLOCKED",
                "policy": {
                    "reason": "UNAUTHORIZED_ACTION",
                },
            },
        },
    ]

    result = engine.replay(
        scenario_id="MSC-002",
        original_steps=original_steps,
    )

    step = result["steps"][0]

    assert step["original_step_id"] == 1
    assert step["original_trace_id"] == "TRACE-ABC"
    assert step["replay_trace_id"] == "RPL-0001"

    assert step["tool"] == "refund_order"
    assert step["arguments"]["order_id"] == "ORD-1024"

    assert step["status"] == "MATCH"