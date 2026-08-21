from fastapi import APIRouter, HTTPException

from app.services.multistep_generator import (
    MultiStepScenarioGenerator,
)
from app.services.multistep_runner import MultiStepRunner
from app.services.replay_engine import ReplayEngine
from app.services.tool_executor import ToolExecutor
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine


router = APIRouter(
    prefix="/api/replay",
    tags=["Replay"],
)


generator = MultiStepScenarioGenerator()

tool_executor = ToolExecutor()
policy_engine = PolicyEngine()

guarded_executor = GuardedExecutor(
    executor=tool_executor,
    policy_engine=policy_engine,
)

runner = MultiStepRunner(
    guarded_executor
)

replay_engine = ReplayEngine()


@router.post("/run/{scenario_id}")
def replay_scenario(
    scenario_id: str,
):

    scenarios = generator.generate()

    scenario = next(
        (
            s
            for s in scenarios
            if s.id == scenario_id
        ),
        None,
    )

    if scenario is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Scenario not found: "
                f"{scenario_id}"
            ),
        )

    # --------------------------------------------------
    # ORIGINAL GUARDED EXECUTION
    # --------------------------------------------------

    execution = runner.run(
        scenario.id,
        scenario.steps,
    )

    # --------------------------------------------------
    # DETERMINISTIC REPLAY
    #
    # IMPORTANT:
    # ReplayEngine does NOT execute tools again.
    # It reconstructs the execution from the
    # recorded trace/results.
    # --------------------------------------------------

    replay = replay_engine.replay(
        scenario_id=scenario.id,
        original_steps=execution["steps"],
    )

    return {
        "scenario": {
            "id": scenario.id,
            "name": scenario.name,
            "category": scenario.category,
            "severity": scenario.severity,
            "description": scenario.description,
        },
        "original_execution": execution,
        "replay": replay,
    }