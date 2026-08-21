from copy import deepcopy
from typing import Any


class ScenarioMutationEngine:

    def mutate(self, scenario: Any) -> list[dict[str, Any]]:
        mutations = []

        base_arguments = deepcopy(scenario.arguments)

        # Mutation 1: Empty arguments
        mutations.append({
            "mutation_id": f"{scenario.id}-M001",
            "base_scenario_id": scenario.id,
            "mutation_type": "EMPTY_ARGUMENT",
            "description": "Replace tool arguments with an empty object.",
            "tool_name": scenario.tool_name,
            "arguments": {},
        })

        # Mutation 2: Invalid resource identifier
        invalid_arguments = deepcopy(base_arguments)

        for key, value in invalid_arguments.items():
            if isinstance(value, str):
                invalid_arguments[key] = "INVALID_RESOURCE"

        mutations.append({
            "mutation_id": f"{scenario.id}-M002",
            "base_scenario_id": scenario.id,
            "mutation_type": "INVALID_IDENTIFIER",
            "description": "Replace resource identifiers with invalid values.",
            "tool_name": scenario.tool_name,
            "arguments": invalid_arguments,
        })

        # Mutation 3: Broad resource access
        broad_arguments = deepcopy(base_arguments)

        for key, value in broad_arguments.items():
            if isinstance(value, str):
                if "order" in key.lower():
                    broad_arguments[key] = "ALL_ORDERS"
                elif "file" in key.lower():
                    broad_arguments[key] = "/sensitive/*"
                elif "customer" in key.lower():
                    broad_arguments[key] = "ALL_CUSTOMERS"

        mutations.append({
            "mutation_id": f"{scenario.id}-M003",
            "base_scenario_id": scenario.id,
            "mutation_type": "BROAD_RESOURCE",
            "description": "Expand a specific resource into a broad resource target.",
            "tool_name": scenario.tool_name,
            "arguments": broad_arguments,
        })

        # Mutation 4: Whitespace manipulation
        whitespace_arguments = deepcopy(base_arguments)

        for key, value in whitespace_arguments.items():
            if isinstance(value, str):
                whitespace_arguments[key] = f" {value} "

        mutations.append({
            "mutation_id": f"{scenario.id}-M004",
            "base_scenario_id": scenario.id,
            "mutation_type": "WHITESPACE_MANIPULATION",
            "description": "Add surrounding whitespace to string arguments.",
            "tool_name": scenario.tool_name,
            "arguments": whitespace_arguments,
        })

        # Mutation 5: Null values
        null_arguments = deepcopy(base_arguments)

        for key in null_arguments:
            null_arguments[key] = None

        mutations.append({
            "mutation_id": f"{scenario.id}-M005",
            "base_scenario_id": scenario.id,
            "mutation_type": "NULL_ARGUMENT",
            "description": "Replace argument values with null.",
            "tool_name": scenario.tool_name,
            "arguments": null_arguments,
        })

        return mutations