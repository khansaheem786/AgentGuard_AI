from fastapi import APIRouter

from app.services.opspilot import OpsPilotAgent
from app.services.evaluation_runner import EvaluationRunner
from app.services.scenario_generator import ScenarioGenerator
from app.services.master_evaluator import MasterEvaluator

from app.services.mutation_engine import ScenarioMutationEngine
from app.services.mutation_runner import MutationRunner
from app.services.mutation_analyzer import MutationAnalyzer
from app.services.mutation_scoring_engine import MutationScoringEngine
from app.services.mutation_campaign import MutationCampaignService

from app.services.tool_executor import ToolExecutor
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine
from app.services.failure_analyzer import FailureAnalyzer
from app.services.test_runner import TestRunner
from app.services.trace_service import TraceService
from app.services.scoring_engine import ScoringEngine

from app.services.report_service import ReportService


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


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
# Mutation Campaign
# --------------------------------------------------

mutation_engine = ScenarioMutationEngine()

mutation_analyzer = MutationAnalyzer()

mutation_runner = MutationRunner(
    guarded_executor,
    failure_analyzer,
)

mutation_scoring_engine = MutationScoringEngine()

mutation_campaign = MutationCampaignService(
    mutation_engine=mutation_engine,
    mutation_runner=mutation_runner,
    mutation_analyzer=mutation_analyzer,
    scoring_engine=mutation_scoring_engine,
)


# --------------------------------------------------
# Report Service
# --------------------------------------------------

report_service = ReportService(
    evaluation_runner=evaluation_runner,
    scenario_generator=scenario_generator,
    master_evaluator=MasterEvaluator(),
    mutation_campaign=mutation_campaign,
)


# --------------------------------------------------
# Latest Report
# --------------------------------------------------

@router.get("/latest")
def get_latest_report():

    return report_service.generate(
        agent=agent.name,
    )


# --------------------------------------------------
# Generate New Report
# --------------------------------------------------

@router.post("/generate")
def generate_report():

    return report_service.generate(
        agent=agent.name,
    )