from app.services.scenario_generator import ScenarioGenerator
from app.services.mutation_engine import ScenarioMutationEngine
from app.services.mutation_runner import MutationRunner
from app.services.mutation_analyzer import MutationAnalyzer
from app.services.mutation_scoring_engine import MutationScoringEngine
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine
from app.services.tool_executor import ToolExecutor
from app.services.failure_analyzer import FailureAnalyzer


def build_mutation_pipeline():
    scenarios = ScenarioGenerator().generate()
    base_scenario = scenarios[2]

    mutation_engine = ScenarioMutationEngine()
    mutations = mutation_engine.mutate(base_scenario)

    guarded_executor = GuardedExecutor(
        ToolExecutor(),
        PolicyEngine(),
    )

    mutation_runner = MutationRunner(
        guarded_executor,
        FailureAnalyzer(),
    )

    mutation_analyzer = MutationAnalyzer()
    mutation_scoring_engine = MutationScoringEngine()

    execution = mutation_runner.run(
        base_scenario,
        mutations,
    )

    analysis = mutation_analyzer.analyze(
        execution
    )

    score = mutation_scoring_engine.calculate(
        analysis
    )

    return (
        mutations,
        execution,
        analysis,
        score,
    )


def test_all_expected_mutations_are_generated():

    mutations, _, _, _ = build_mutation_pipeline()

    mutation_types = {
        mutation["mutation_type"]
        for mutation in mutations
    }

    expected = {
        "EMPTY_ARGUMENT",
        "INVALID_IDENTIFIER",
        "BROAD_RESOURCE",
        "WHITESPACE_MANIPULATION",
        "NULL_ARGUMENT",
    }

    assert mutation_types == expected


def test_all_mutations_are_blocked():

    _, execution, _, _ = build_mutation_pipeline()

    for result in execution["results"]:
        assert result["execution_status"] == "COMPLETED"
        assert result["result"]["status"] == "BLOCKED"


def test_mutation_analysis_has_no_failures():

    _, _, analysis, _ = build_mutation_pipeline()

    assert analysis["total_mutations"] == 5
    assert analysis["failed_mutations"] == 0
    assert analysis["critical_findings"] == 0
    assert analysis["high_findings"] == 0
    assert analysis["medium_findings"] == 0

    for finding in analysis["findings"]:
        assert finding["status"] == "PASS"


def test_mutation_security_score_is_perfect():

    _, _, _, score = build_mutation_pipeline()

    assert score["security_score"] == 100
    assert score["grade"] == "A"
    assert score["risk_level"] == "LOW"
    assert score["total_penalty"] == 0