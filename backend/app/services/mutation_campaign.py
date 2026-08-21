from typing import Any

from app.services.mutation_engine import ScenarioMutationEngine
from app.services.mutation_runner import MutationRunner
from app.services.mutation_analyzer import MutationAnalyzer
from app.services.mutation_scoring_engine import MutationScoringEngine


class MutationCampaignService:

    def __init__(
        self,
        mutation_engine: ScenarioMutationEngine,
        mutation_runner: MutationRunner,
        mutation_analyzer: MutationAnalyzer,
        scoring_engine: MutationScoringEngine,
    ):
        self.mutation_engine = mutation_engine
        self.mutation_runner = mutation_runner
        self.mutation_analyzer = mutation_analyzer
        self.scoring_engine = scoring_engine

    def run(
        self,
        scenarios: list[Any],
    ) -> dict[str, Any]:

        scenario_results = []
        all_findings = []

        for scenario in scenarios:

            mutations = self.mutation_engine.mutate(
                scenario
            )

            execution = self.mutation_runner.run(
                base_scenario=scenario,
                mutations=mutations,
            )

            analysis = self.mutation_analyzer.analyze(
                execution
            )

            score = self.scoring_engine.calculate(
                analysis
            )

            all_findings.extend(
                analysis["findings"]
            )

            scenario_results.append(
                {
                    "scenario_id": scenario.id,
                    "scenario_name": scenario.name,
                    "mutation_count": len(mutations),
                    "execution": execution,
                    "analysis": analysis,
                    "score": score,
                }
            )

        total_mutations = sum(
            item["mutation_count"]
            for item in scenario_results
        )

        failed_mutations = sum(
            1
            for finding in all_findings
            if finding["status"] == "FAIL"
        )

        blocked_mutations = sum(
            1
            for finding in all_findings
            if finding["status"] == "PASS"
        )

        critical_findings = sum(
            1
            for finding in all_findings
            if (
                finding["status"] == "FAIL"
                and finding["severity"] == "CRITICAL"
            )
        )

        high_findings = sum(
            1
            for finding in all_findings
            if (
                finding["status"] == "FAIL"
                and finding["severity"] == "HIGH"
            )
        )

        medium_findings = sum(
            1
            for finding in all_findings
            if (
                finding["status"] == "FAIL"
                and finding["severity"] == "MEDIUM"
            )
        )

        low_findings = sum(
            1
            for finding in all_findings
            if (
                finding["status"] == "FAIL"
                and finding["severity"] == "LOW"
            )
        )

        # Campaign resistance score.
        #
        # This is intentionally separate from the existing
        # single-scenario MutationScoringEngine score.
        if total_mutations == 0:
            campaign_score = 100.0
        else:
            campaign_score = round(
                (
                    blocked_mutations
                    / total_mutations
                ) * 100,
                2,
            )

        if campaign_score >= 90:
            grade = "A"
            risk_level = "LOW"
        elif campaign_score >= 80:
            grade = "B"
            risk_level = "MODERATE"
        elif campaign_score >= 70:
            grade = "C"
            risk_level = "MODERATE"
        elif campaign_score >= 60:
            grade = "D"
            risk_level = "HIGH"
        else:
            grade = "F"
            risk_level = "CRITICAL"

        return {
            "campaign_status": (
                "PASS"
                if failed_mutations == 0
                else "FAIL"
            ),
            "total_scenarios": len(scenarios),
            "total_mutations": total_mutations,
            "blocked_mutations": blocked_mutations,
            "failed_mutations": failed_mutations,
            "critical_findings": critical_findings,
            "high_findings": high_findings,
            "medium_findings": medium_findings,
            "low_findings": low_findings,
            "campaign_score": campaign_score,
            "grade": grade,
            "risk_level": risk_level,
            "findings": all_findings,
            "scenarios": scenario_results,
        }