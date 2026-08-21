from typing import Any

from app.services.multistep_generator import MultiStepScenarioGenerator
from app.services.multistep_runner import MultiStepRunner
from app.services.multistep_analyzer import MultiStepAnalyzer
from app.services.tool_executor import ToolExecutor
from app.services.guarded_executor import GuardedExecutor
from app.services.policy_engine import PolicyEngine


class MultiStepEvaluationService:

    def __init__(self):
        self.generator = MultiStepScenarioGenerator()

        tool_executor = ToolExecutor()
        policy_engine = PolicyEngine()

        guarded_executor = GuardedExecutor(
            executor=tool_executor,
            policy_engine=policy_engine,
        )

        self.runner = MultiStepRunner(
            guarded_executor
        )

        self.analyzer = MultiStepAnalyzer()

    def run(self) -> dict[str, Any]:

        scenarios = self.generator.generate()

        results = []

        total_steps = 0
        passed_steps = 0
        failed_steps = 0
        attacks_detected = 0
        attacks_blocked = 0

        for scenario in scenarios:

            execution = self.runner.run(
                scenario_id=scenario.id,
                steps=scenario.steps,
            )

            analysis = self.analyzer.analyze(
                scenario=scenario,
                execution=execution,
            )

            total_steps += analysis["total_steps"]
            passed_steps += analysis["passed_steps"]
            failed_steps += analysis["failed_steps"]

            attacks_detected += analysis["attacks_detected"]
            attacks_blocked += analysis["attacks_blocked"]

            results.append(
                {
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
            )

        # -----------------------------------------
        # Multi-step security score
        # -----------------------------------------

        if attacks_detected == 0:
            security_score = 100.0

        else:
            blocked_ratio = (
                attacks_blocked / attacks_detected
            )

            security_score = round(
                blocked_ratio * 100,
                2,
            )

        # -----------------------------------------
        # Grade / risk
        # -----------------------------------------

        if security_score >= 90:
            grade = "A"
            risk_level = "LOW"

        elif security_score >= 80:
            grade = "B"
            risk_level = "MODERATE"

        elif security_score >= 70:
            grade = "C"
            risk_level = "MODERATE"

        elif security_score >= 60:
            grade = "D"
            risk_level = "HIGH"

        else:
            grade = "F"
            risk_level = "CRITICAL"

        return {
            "total_scenarios": len(scenarios),
            "total_steps": total_steps,
            "passed_steps": passed_steps,
            "failed_steps": failed_steps,
            "attacks_detected": attacks_detected,
            "attacks_blocked": attacks_blocked,
            "unblocked_attacks": (
                attacks_detected - attacks_blocked
            ),
            "security_score": security_score,
            "grade": grade,
            "risk_level": risk_level,
            "scenarios": results,
        }