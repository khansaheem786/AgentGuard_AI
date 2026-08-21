from fastapi import APIRouter

from app.services.opspilot import OpsPilotAgent
from app.services.tool_executor import ToolExecutor
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine
from app.services.trace_service import TraceService
from app.services.test_runner import TestRunner
from app.services.scenario_generator import ScenarioGenerator
from app.services.evaluation_runner import EvaluationRunner
from app.services.failure_analyzer import FailureAnalyzer
from app.services.scoring_engine import ScoringEngine

from app.services.mutation_engine import ScenarioMutationEngine
from app.services.mutation_runner import MutationRunner
from app.services.mutation_analyzer import MutationAnalyzer
from app.services.mutation_scoring_engine import MutationScoringEngine
from app.services.master_evaluator import MasterEvaluator
from app.services.multistep_evaluation_service import (
    MultiStepEvaluationService,
)



router = APIRouter()

# --------------------------------------------------
# Core components
# --------------------------------------------------

agent = OpsPilotAgent()

executor = ToolExecutor()
policy_engine = PolicyEngine()

guarded_executor = GuardedExecutor(
    executor=executor,
    policy_engine=policy_engine,
)

trace_service = TraceService()

test_runner = TestRunner(
    agent=agent,
    executor=guarded_executor,
    trace_service=trace_service,
)
scenario_generator = ScenarioGenerator()
failure_analyzer = FailureAnalyzer()
scoring_engine = ScoringEngine()

evaluation_runner = EvaluationRunner(
    scenario_generator=scenario_generator,
    test_runner=test_runner,
    failure_analyzer=failure_analyzer,
    scoring_engine=scoring_engine,
)

# --------------------------------------------------
# Mutation components
# --------------------------------------------------

mutation_engine = ScenarioMutationEngine()

mutation_runner = MutationRunner(
    guarded_executor,
    failure_analyzer,
)

mutation_analyzer = MutationAnalyzer()
mutation_scoring_engine = MutationScoringEngine()

master_evaluator = MasterEvaluator()

multistep_evaluation_service = MultiStepEvaluationService()


# --------------------------------------------------
# Normal evaluation
# --------------------------------------------------

@router.post("/run")
def run_evaluation():

    return evaluation_runner.run_all()


# --------------------------------------------------
# Master AgentGuard evaluation
# --------------------------------------------------

@router.post("/master")
def run_master_evaluation():

    # ----------------------------------------------
    # 1. Run normal evaluation
    # ----------------------------------------------

    normal_evaluation = evaluation_runner.run_all()

    normal_results = normal_evaluation["results"]

    # ----------------------------------------------
    # 2. Generate mutation tests
    # ----------------------------------------------

    scenarios = scenario_generator.generate()

    # Currently use the refund scenario as
    # the mutation target.
    base_scenario = scenarios[2]

    mutations = mutation_engine.mutate(
        base_scenario
    )

    # ----------------------------------------------
    # 3. Execute mutations through GuardedExecutor
    # ----------------------------------------------

    mutation_execution = mutation_runner.run(
        base_scenario,
        mutations,
    )

    # ----------------------------------------------
    # 4. Analyze mutations
    # ----------------------------------------------

    mutation_analysis = mutation_analyzer.analyze(
        mutation_execution
    )


    # ----------------------------------------------
    # 5. Run multi-step security evaluation
    # ----------------------------------------------

    multistep_analysis = (
        multistep_evaluation_service.run()
    )

    # ----------------------------------------------
    # 6. Generate unified AgentGuard report
    # ----------------------------------------------

    report = master_evaluator.evaluate(
        agent=agent.name,
        normal_results=normal_results,
        mutation_analysis=mutation_analysis,
        multistep_analysis=multistep_analysis,
    )
    # ----------------------------------------------
    # 7. Expose detailed normal scenario results
    #    for the AgentGuard frontend
    # ----------------------------------------------

    report["normal_results"] = normal_results

    return report