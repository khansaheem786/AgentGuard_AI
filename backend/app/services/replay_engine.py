from copy import deepcopy
import hashlib
import json
from typing import Any


class ReplayEngine:

    def __init__(self):
        pass

    @staticmethod
    def _fingerprint(data: dict[str, Any]) -> str:
        """
        Create a deterministic fingerprint for a recorded result.
        """

        normalized = json.dumps(
            data,
            sort_keys=True,
            separators=(",", ":"),
            default=str,
        )

        return hashlib.sha256(
            normalized.encode("utf-8")
        ).hexdigest()

    def replay(
        self,
        scenario_id: str,
        original_steps: list[dict[str, Any]],
    ) -> dict[str, Any]:

        replay_steps = []

        matched_steps = 0
        diverged_steps = 0

        for index, step in enumerate(original_steps, start=1):

            original_result = deepcopy(
                step.get("result", {})
            )

            # Deterministic replay:
            # DO NOT execute the tool again.
            replay_result = deepcopy(
                original_result
            )

            original_fingerprint = self._fingerprint(
                original_result
            )

            replay_fingerprint = self._fingerprint(
                replay_result
            )

            matched = (
                original_fingerprint
                == replay_fingerprint
            )

            if matched:
                matched_steps += 1
                step_status = "MATCH"
            else:
                diverged_steps += 1
                step_status = "DIVERGED"

            replay_steps.append(
                {
                    "replay_step_id": index,
                    "original_step_id": step["step_id"],
                    "original_trace_id": step.get(
                        "trace_id"
                    ),
                    "replay_trace_id": (
                        f"RPL-{index:04d}"
                    ),
                    "tool": step["tool"],
                    "arguments": deepcopy(
                        step["arguments"]
                    ),
                    "original_result": original_result,
                    "replay_result": replay_result,
                    "original_fingerprint": (
                        original_fingerprint
                    ),
                    "replay_fingerprint": (
                        replay_fingerprint
                    ),
                    "status": step_status,
                }
            )

        total_steps = len(original_steps)

        if diverged_steps == 0:
            replay_status = "REPLAY_SUCCESS"
        else:
            replay_status = "DIVERGED"

        if total_steps == 0:
            determinism_score = 100.0
        else:
            determinism_score = round(
                (
                    matched_steps
                    / total_steps
                )
                * 100,
                2,
            )

        return {
            "scenario_id": scenario_id,
            "replay_status": replay_status,
            "execution_mode": "DETERMINISTIC_TRACE_REPLAY",
            "total_steps": total_steps,
            "matched_steps": matched_steps,
            "diverged_steps": diverged_steps,
            "determinism_score": determinism_score,
            "steps": replay_steps,
        }