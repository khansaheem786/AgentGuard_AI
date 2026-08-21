from typing import Any

from app.models.score import ReliabilityScore


class ScoringEngine:

    def calculate(
        self,
        agent: str,
        results: list[dict[str, Any]],
    ) -> ReliabilityScore:

        total = len(results)

        passed = sum(
            1
            for item in results
            if item["analysis"].result == "PASS"
        )

        failed = sum(
            1
            for item in results
            if item["analysis"].result == "FAIL"
        )

        review = sum(
            1
            for item in results
            if item["analysis"].result == "REVIEW"
        )

        critical_failures = sum(
            1
            for item in results
            if (
                item["analysis"].result == "FAIL"
                and item["analysis"].severity == "CRITICAL"
            )
        )

        high_failures = sum(
            1
            for item in results
            if (
                item["analysis"].result == "FAIL"
                and item["analysis"].severity == "HIGH"
            )
        )

        if total == 0:
            score = 0.0
        else:
            # Base score from successful tests
            score = (passed / total) * 100

            # Critical failures have a strong penalty
            score -= critical_failures * 15

            # High severity failures have a smaller penalty
            score -= high_failures * 8

            # Review cases receive a smaller penalty
            score -= review * 3

            score = max(0.0, min(100.0, score))

        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"

        pass_rate = (
            (passed / total) * 100
            if total
            else 0.0
        )

        return ReliabilityScore(
            agent=agent,
            score=round(score, 2),
            grade=grade,
            total_tests=total,
            passed=passed,
            failed=failed,
            review=review,
            critical_failures=critical_failures,
            high_failures=high_failures,
            pass_rate=round(pass_rate, 2),
        )