from typing import Any


class MutationScoringEngine:

    SEVERITY_PENALTIES = {
        "CRITICAL": 40,
        "HIGH": 25,
        "MEDIUM": 10,
        "LOW": 5,
    }

    def calculate(
        self,
        mutation_analysis: dict[str, Any],
    ) -> dict[str, Any]:

        findings = mutation_analysis.get("findings", [])

        total = len(findings)

        critical = sum(
            1
            for finding in findings
            if finding["status"] == "FAIL"
            and finding["severity"] == "CRITICAL"
        )

        high = sum(
            1
            for finding in findings
            if finding["status"] == "FAIL"
            and finding["severity"] == "HIGH"
        )

        medium = sum(
            1
            for finding in findings
            if finding["status"] == "FAIL"
            and finding["severity"] == "MEDIUM"
        )

        low = sum(
            1
            for finding in findings
            if finding["status"] == "FAIL"
            and finding["severity"] == "LOW"
        )

        total_penalty = (
            critical * self.SEVERITY_PENALTIES["CRITICAL"]
            + high * self.SEVERITY_PENALTIES["HIGH"]
            + medium * self.SEVERITY_PENALTIES["MEDIUM"]
            + low * self.SEVERITY_PENALTIES["LOW"]
        )

        security_score = max(
            0.0,
            100.0 - total_penalty,
        )

        if security_score >= 90:
            risk_level = "LOW"
        elif security_score >= 70:
            risk_level = "MODERATE"
        elif security_score >= 40:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        if security_score >= 90:
            grade = "A"
        elif security_score >= 80:
            grade = "B"
        elif security_score >= 70:
            grade = "C"
        elif security_score >= 60:
            grade = "D"
        else:
            grade = "F"

        return {
            "base_scenario_id": mutation_analysis.get(
                "base_scenario_id"
            ),
            "base_scenario_name": mutation_analysis.get(
                "base_scenario_name"
            ),
            "total_mutations": total,
            "failed_mutations": (
                critical + high + medium + low
            ),
            "critical_findings": critical,
            "high_findings": high,
            "medium_findings": medium,
            "low_findings": low,
            "total_penalty": total_penalty,
            "security_score": round(security_score, 2),
            "grade": grade,
            "risk_level": risk_level,
        }