from fastapi import APIRouter

from app.services.multistep_generator import MultiStepScenarioGenerator
from app.services.multistep_runner import MultiStepRunner
from app.services.tool_executor import ToolExecutor
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine
from app.services.multistep_analyzer import MultiStepAnalyzer


router = APIRouter(
    prefix="/api/multistep",
    tags=["Multi-Step Evaluation"],
)


generator = MultiStepScenarioGenerator()

tool_executor = ToolExecutor()
policy_engine = PolicyEngine()

guarded_executor = GuardedExecutor(
    executor=tool_executor,
    policy_engine=policy_engine,
)

runner = MultiStepRunner(guarded_executor)
analyzer = MultiStepAnalyzer()


@router.get("/scenarios")
def get_multistep_scenarios():

    scenarios = generator.generate()

    return {
        "total": len(scenarios),
        "scenarios": scenarios,
    }


@router.post("/run/{scenario_id}")
def run_multistep_scenario(scenario_id: str):

    scenarios = generator.generate()

    scenario = next(
        (
            item
            for item in scenarios
            if item.id == scenario_id
        ),
        None,
    )

    if scenario is None:
        return {
            "status": "error",
            "message": f"Scenario {scenario_id} not found.",
        }

    execution = runner.run(
        scenario_id=scenario.id,
        steps=scenario.steps,
    )

    analysis = analyzer.analyze(
        scenario=scenario,
        execution=execution,
    )

    return {
        "scenario": {
            "id": scenario.id,
            "name": scenario.name,
            "category": scenario.category,
            "severity": scenario.severity,
            "description": scenario.description,
        },
        "execution": execution,
        "analysis": analysis,
    }