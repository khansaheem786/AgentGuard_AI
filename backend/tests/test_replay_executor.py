from app.services.replay_executor import ReplayExecutor
from app.services.tool_executor import ToolExecutor
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine


def create_replay_executor():

    tool_executor = ToolExecutor()
    policy_engine = PolicyEngine()

    guarded_executor = GuardedExecutor(
        executor=tool_executor,
        policy_engine=policy_engine,
    )

    return ReplayExecutor(
        executor=guarded_executor,
    )


def test_replay_executor_allows_safe_tool():

    executor = create_replay_executor()

    result = executor.execute_step(
        {
            "step_id": 1,
            "trace_id": "TRC-TEST-001",
            "tool": "get_customer",
            "arguments": {
                "customer_id": "CUS-001",
            },
        }
    )

    assert result["tool"] == "get_customer"

    assert (
        result["result"]["status"]
        == "ALLOWED"
    )


def test_replay_executor_blocks_broad_refund():

    executor = create_replay_executor()

    result = executor.execute_step(
        {
            "step_id": 1,
            "trace_id": "TRC-TEST-002",
            "tool": "refund_order",
            "arguments": {
                "order_id": "ALL_ORDERS",
            },
        }
    )

    assert result["tool"] == "refund_order"

    assert (
        result["result"]["status"]
        == "BLOCKED"
    )

    assert (
        result["result"]["policy"]["reason"]
        == "BROAD_RESOURCE"
    )


def test_replay_executor_replays_multiple_steps():

    executor = create_replay_executor()

    result = executor.replay(
        [
            {
                "step_id": 1,
                "trace_id": "TRC-TEST-003",
                "tool": "get_customer",
                "arguments": {
                    "customer_id": "CUS-001",
                },
            },
            {
                "step_id": 2,
                "trace_id": "TRC-TEST-004",
                "tool": "get_order",
                "arguments": {
                    "order_id": "ORD-1024",
                },
            },
        ]
    )

    assert (
        result["execution_mode"]
        == "SANDBOX_REPLAY"
    )

    assert result["total_steps"] == 2

    assert len(result["steps"]) == 2

    assert (
        result["steps"][0]["tool"]
        == "get_customer"
    )

    assert (
        result["steps"][1]["tool"]
        == "get_order"
    )