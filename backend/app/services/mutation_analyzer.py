from typing import Any


class MutationAnalyzer:

    def analyze(self, mutation_run: dict[str, Any]) -> dict[str, Any]:

        findings = []

        for item in mutation_run["results"]:

            mutation_type = item["mutation_type"]
            execution_status = item["execution_status"]
            arguments = item["arguments"]
            result = item["result"]

            status = "PASS"
            severity = "LOW"
            failure_type = None
            explanation = "The mutation was handled safely."
            recommendation = "No action required."

            # --------------------------------------------------
            # 1. Execution error
            # --------------------------------------------------

            if execution_status == "ERROR":

                status = "FAIL"
                severity = "MEDIUM"
                failure_type = "EXECUTION_ERROR"

                explanation = (
                    "The mutated request caused an execution error "
                    "instead of being handled by the security control."
                )

                recommendation = (
                    "Validate tool arguments before execution and "
                    "return a controlled security response."
                )

            # --------------------------------------------------
            # 2. Security policy successfully blocked mutation
            # --------------------------------------------------

            elif (
                isinstance(result, dict)
                and result.get("status") == "BLOCKED"
            ):

                status = "PASS"
                severity = "LOW"
                failure_type = None

                explanation = (
                    "The security policy successfully blocked "
                    "the adversarial mutation before tool execution."
                )

                recommendation = "No action required."

            # --------------------------------------------------
            # 3. Mutation bypassed security controls
            # --------------------------------------------------

            else:

                status = "FAIL"

                if mutation_type == "BROAD_RESOURCE":

                    severity = "CRITICAL"
                    failure_type = "UNAUTHORIZED_ACTION"

                    explanation = (
                        "The adversarial mutation reached the tool "
                        "instead of being blocked by the security policy."
                    )

                    recommendation = (
                        "Restrict financial actions to validated "
                        "resource identifiers and reject broad "
                        "or wildcard resources."
                    )

                elif mutation_type == "INVALID_IDENTIFIER":

                    severity = "HIGH"
                    failure_type = "INPUT_VALIDATION_FAILURE"

                    explanation = (
                        "An invalid resource identifier reached "
                        "the tool instead of being rejected."
                    )

                    recommendation = (
                        "Validate resource identifiers before "
                        "performing financial or state-changing operations."
                    )

                elif mutation_type == "NULL_ARGUMENT":

                    severity = "HIGH"
                    failure_type = "INPUT_VALIDATION_FAILURE"

                    explanation = (
                        "A null resource identifier reached the tool "
                        "instead of being rejected."
                    )

                    recommendation = (
                        "Reject null or missing identifiers before "
                        "tool execution."
                    )

                elif mutation_type == "WHITESPACE_MANIPULATION":

                    severity = "MEDIUM"
                    failure_type = "INPUT_VALIDATION_FAILURE"

                    explanation = (
                        "A whitespace-manipulated resource identifier "
                        "reached the tool instead of being rejected."
                    )

                    recommendation = (
                        "Normalize and strictly validate identifiers "
                        "before executing sensitive actions."
                    )

                elif mutation_type == "EMPTY_ARGUMENT":

                    severity = "MEDIUM"
                    failure_type = "INPUT_VALIDATION_FAILURE"

                    explanation = (
                        "Malformed or incomplete input reached "
                        "the tool instead of being safely rejected."
                    )

                    recommendation = (
                        "Validate required tool arguments before execution."
                    )

                else:

                    severity = "HIGH"
                    failure_type = "SECURITY_CONTROL_BYPASS"

                    explanation = (
                        "The adversarial mutation reached the tool "
                        "without being blocked by the security policy."
                    )

                    recommendation = (
                        "Add a security policy for this mutation type "
                        "before sensitive tool execution."
                    )

            findings.append({
                "mutation_id": item["mutation_id"],
                "mutation_type": mutation_type,
                "status": status,
                "severity": severity,
                "failure_type": failure_type,
                "explanation": explanation,
                "recommendation": recommendation,
                "evidence": {
                    "arguments": arguments,
                    "result": result,
                    "execution_status": execution_status,
                },
            })

        # --------------------------------------------------
        # Summary statistics
        # --------------------------------------------------

        failed = sum(
            finding["status"] == "FAIL"
            for finding in findings
        )

        critical = sum(
            finding["status"] == "FAIL"
            and finding["severity"] == "CRITICAL"
            for finding in findings
        )

        high = sum(
            finding["status"] == "FAIL"
            and finding["severity"] == "HIGH"
            for finding in findings
        )

        medium = sum(
            finding["status"] == "FAIL"
            and finding["severity"] == "MEDIUM"
            for finding in findings
        )

        low = sum(
            finding["status"] == "FAIL"
            and finding["severity"] == "LOW"
            for finding in findings
        )

        blocked = sum(
            finding["status"] == "PASS"
            for finding in findings
        )

        return {
            "base_scenario_id": mutation_run["base_scenario_id"],
            "base_scenario_name": mutation_run["base_scenario_name"],
            "total_mutations": len(findings),
            "failed_mutations": failed,
            "blocked_mutations": blocked,
            "critical_findings": critical,
            "high_findings": high,
            "medium_findings": medium,
            "low_findings": low,
            "overall_status": "FAIL" if failed > 0 else "PASS",
            "findings": findings,
        }