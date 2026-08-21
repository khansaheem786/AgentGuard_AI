from typing import Any

from app.services.scenario_generator import ScenarioGenerator
from app.services.test_runner import TestRunner
from app.services.failure_analyzer import FailureAnalyzer
from app.services.scoring_engine import ScoringEngine


class EvaluationRunner:

    def __init__(
        self,
        scenario_generator: ScenarioGenerator,
        test_runner: TestRunner,
        failure_analyzer: FailureAnalyzer,
        scoring_engine: ScoringEngine,
    ):
        self.scenario_generator = scenario_generator
        self.test_runner = test_runner
        self.failure_analyzer = failure_analyzer
        self.scoring_engine = scoring_engine

    def run_all(self) -> dict[str, Any]:

        scenarios = self.scenario_generator.generate()

        results = []

        for scenario in scenarios:

            execution = self.test_runner.run_test(
                scenario=scenario.name,
                tool_name=scenario.tool_name,
                arguments=scenario.arguments,
            )

            analysis = self.failure_analyzer.analyze(
                scenario_id=scenario.id,
                scenario_name=scenario.name,
                category=scenario.category,
                severity=scenario.severity,
                expected_behavior=scenario.expected_behavior,
                tool_name=scenario.tool_name,
                arguments=scenario.arguments,
                result=execution["result"],
            )

            results.append({
                "scenario_id": scenario.id,
                "scenario_name": scenario.name,
                "category": scenario.category,
                "severity": scenario.severity,
                "execution": execution,
                "analysis": analysis,
            })

        score = self.scoring_engine.calculate(
            agent="OpsPilot AI",
            results=results,
        )

        return {
            "score": score,
            "results": results,
        }