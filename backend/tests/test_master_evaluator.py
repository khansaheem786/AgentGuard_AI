from app.services.scenario_generator import ScenarioGenerator
from app.services.failure_analyzer import FailureAnalyzer
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine
from app.services.tool_executor import ToolExecutor
from app.services.mutation_engine import ScenarioMutationEngine
from app.services.mutation_runner import MutationRunner
from app.services.mutation_analyzer import MutationAnalyzer
from app.services.master_evaluator import MasterEvaluator


def build_master_evaluation():
    scenarios = ScenarioGenerator().generate()

    executor = GuardedExecutor(
        ToolExecutor(),
        PolicyEngine(),
    )

    failure_analyzer = FailureAnalyzer()

    normal_results = []

    for scenario in scenarios:
        result = executor.execute(
            scenario.tool_name,
            scenario.arguments,
        )

        analysis = failure_analyzer.analyze(
            scenario_id=scenario.id,
            scenario_name=scenario.name,
            category=scenario.category,
            severity=scenario.severity,
            expected_behavior=scenario.expected_behavior,
            tool_name=scenario.tool_name,
            arguments=scenario.arguments,
            result=result,
        )

        normal_results.append({
            "scenario_id": scenario.id,
            "scenario_name": scenario.name,
            "analysis": analysis,
        })

    base_scenario = scenarios[2]

    mutation_engine = ScenarioMutationEngine()
    mutations = mutation_engine.mutate(base_scenario)

    mutation_runner = MutationRunner(
        executor,
        failure_analyzer,
    )

    mutation_execution = mutation_runner.run(
        base_scenario,
        mutations,
    )

    mutation_analysis = MutationAnalyzer().analyze(
        mutation_execution
    )

    report = MasterEvaluator().evaluate(
        agent="OpsPilot AI",
        normal_results=normal_results,
        mutation_analysis=mutation_analysis,
    )

    return report


def test_master_evaluation_has_perfect_overall_score():

    report = build_master_evaluation()

    assert report["overall"]["score"] == 100
    assert report["overall"]["grade"] == "A"
    assert report["overall"]["risk_level"] == "LOW"


def test_master_reliability_score_is_perfect():

    report = build_master_evaluation()

    reliability = report["reliability"]

    assert reliability["total_tests"] == 5
    assert reliability["passed"] == 5
    assert reliability["failed"] == 0
    assert reliability["review"] == 0
    assert reliability["pass_rate"] == 100


def test_master_security_score_is_perfect():

    report = build_master_evaluation()

    security = report["security"]

    assert security["total_mutations"] == 5
    assert security["failed_mutations"] == 0
    assert security["critical_findings"] == 0
    assert security["high_findings"] == 0
    assert security["medium_findings"] == 0
    assert security["security_score"] == 100
    assert security["grade"] == "A"
    assert security["risk_level"] == "LOW"


def test_master_summary_matches_results():

    report = build_master_evaluation()

    summary = report["summary"]

    assert summary["normal_tests"] == 5
    assert summary["normal_passed"] == 5
    assert summary["normal_failed"] == 0

    assert summary["mutation_tests"] == 5
    assert summary["mutation_failed"] == 0

    assert summary["critical_findings"] == 0
    assert summary["high_findings"] == 0
    assert summary["medium_findings"] == 0