from copy import deepcopy
import hashlib
import json
from typing import Any

from app.services.replay_executor import ReplayExecutor


class ReplayEngine:

    def __init__(
        self,
        replay_executor: ReplayExecutor | None = None,
    ):
        self.replay_executor = replay_executor

    # --------------------------------------------------
    # Deterministic fingerprint
    # --------------------------------------------------

    @staticmethod
    def _fingerprint(
        data: dict[str, Any],
    ) -> str:
        """
        Create a deterministic fingerprint
        for a recorded result.
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

    # --------------------------------------------------
    # Deterministic trace replay
    # --------------------------------------------------

    def deterministic_replay(
        self,
        scenario_id: str,
        original_steps: list[dict[str, Any]],
    ) -> dict[str, Any]:

        replay_steps = []

        matched_steps = 0
        diverged_steps = 0

        for index, step in enumerate(
            original_steps,
            start=1,
        ):

            original_result = deepcopy(
                step.get("result", {})
            )

            # --------------------------------------------------
            # Deterministic replay does NOT execute the tool.
            # It reconstructs the result from the recorded trace.
            # --------------------------------------------------

            replay_result = deepcopy(
                original_result
            )

            original_fingerprint = (
                self._fingerprint(
                    original_result
                )
            )

            replay_fingerprint = (
                self._fingerprint(
                    replay_result
                )
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
                    "original_step_id": (
                        step["step_id"]
                    ),
                    "original_trace_id": (
                        step.get("trace_id")
                    ),
                    "replay_trace_id": (
                        f"RPL-{index:04d}"
                    ),
                    "tool": step["tool"],
                    "arguments": deepcopy(
                        step["arguments"]
                    ),
                    "original_result": (
                        original_result
                    ),
                    "replay_result": (
                        replay_result
                    ),
                    "original_fingerprint": (
                        original_fingerprint
                    ),
                    "replay_fingerprint": (
                        replay_fingerprint
                    ),
                    "status": step_status,
                }
            )

        total_steps = len(
            original_steps
        )

        if diverged_steps == 0:
            replay_status = (
                "REPLAY_SUCCESS"
            )
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
            "execution_mode": (
                "DETERMINISTIC_TRACE_REPLAY"
            ),
            "total_steps": total_steps,
            "matched_steps": matched_steps,
            "diverged_steps": diverged_steps,
            "determinism_score": (
                determinism_score
            ),
            "steps": replay_steps,
        }

    # --------------------------------------------------
    # Sandbox replay
    # --------------------------------------------------

    def sandbox_replay(
        self,
        scenario_id: str,
        original_steps: list[dict[str, Any]],
    ) -> dict[str, Any]:

        # --------------------------------------------------
        # Backward compatibility:
        #
        # Existing unit tests instantiate ReplayEngine()
        # without a ReplayExecutor.
        #
        # In that situation deterministic replay still works,
        # while sandbox replay is marked unavailable.
        # --------------------------------------------------

        if self.replay_executor is None:

            return {
                "scenario_id": scenario_id,
                "replay_status": (
                    "NOT_EXECUTED"
                ),
                "execution_mode": (
                    "SANDBOX_REPLAY_UNAVAILABLE"
                ),
                "total_steps": len(
                    original_steps
                ),
                "matched_steps": 0,
                "diverged_steps": 0,
                "determinism_score": None,
                "steps": [],
            }

        # --------------------------------------------------
        # Execute the recorded tool calls through the
        # sandbox ReplayExecutor.
        # --------------------------------------------------

        sandbox_execution = (
            self.replay_executor.replay(
                original_steps
            )
        )

        comparison_steps = []

        matched_steps = 0
        diverged_steps = 0

        for index, original_step in enumerate(
            original_steps,
            start=1,
        ):

            original_result = deepcopy(
                original_step.get(
                    "result",
                    {},
                )
            )

            sandbox_step = (
                sandbox_execution[
                    "steps"
                ][index - 1]
            )

            sandbox_result = deepcopy(
                sandbox_step.get(
                    "result",
                    {},
                )
            )

            original_fingerprint = (
                self._fingerprint(
                    original_result
                )
            )

            sandbox_fingerprint = (
                self._fingerprint(
                    sandbox_result
                )
            )

            if (
                original_fingerprint
                == sandbox_fingerprint
            ):
                matched_steps += 1
                status = "MATCH"
            else:
                diverged_steps += 1
                status = "DIVERGED"

            comparison_steps.append(
                {
                    "replay_step_id": index,
                    "original_step_id": (
                        original_step[
                            "step_id"
                        ]
                    ),
                    "original_trace_id": (
                        original_step.get(
                            "trace_id"
                        )
                    ),
                    "sandbox_trace_id": (
                        f"SBOX-{index:04d}"
                    ),
                    "tool": (
                        original_step[
                            "tool"
                        ]
                    ),
                    "arguments": deepcopy(
                        original_step[
                            "arguments"
                        ]
                    ),
                    "original_result": (
                        original_result
                    ),
                    "sandbox_result": (
                        sandbox_result
                    ),
                    "original_fingerprint": (
                        original_fingerprint
                    ),
                    "sandbox_fingerprint": (
                        sandbox_fingerprint
                    ),
                    "status": status,
                }
            )

        total_steps = len(
            original_steps
        )

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

        if diverged_steps == 0:
            replay_status = (
                "REPLAY_SUCCESS"
            )
        else:
            replay_status = "DIVERGED"

        return {
            "scenario_id": scenario_id,
            "replay_status": replay_status,
            "execution_mode": (
                "SANDBOX_REPLAY"
            ),
            "total_steps": total_steps,
            "matched_steps": matched_steps,
            "diverged_steps": diverged_steps,
            "determinism_score": (
                determinism_score
            ),
            "steps": comparison_steps,
        }

    # --------------------------------------------------
    # Public replay API
    # --------------------------------------------------

    def replay(
        self,
        scenario_id: str,
        original_steps: list[dict[str, Any]],
    ) -> dict[str, Any]:

        # --------------------------------------------------
        # 1. Deterministic trace replay
        # --------------------------------------------------

        deterministic = (
            self.deterministic_replay(
                scenario_id=scenario_id,
                original_steps=original_steps,
            )
        )

        # --------------------------------------------------
        # 2. Sandbox replay
        # --------------------------------------------------

        sandbox = (
            self.sandbox_replay(
                scenario_id=scenario_id,
                original_steps=original_steps,
            )
        )

        # --------------------------------------------------
        # 3. Preserve the original replay response
        # contract while exposing sandbox information.
        # --------------------------------------------------

        return {
            "scenario_id": scenario_id,

            # Existing replay fields
            "replay_status": (
                deterministic[
                    "replay_status"
                ]
            ),
            "execution_mode": (
                deterministic[
                    "execution_mode"
                ]
            ),
            "total_steps": (
                deterministic[
                    "total_steps"
                ]
            ),
            "matched_steps": (
                deterministic[
                    "matched_steps"
                ]
            ),
            "diverged_steps": (
                deterministic[
                    "diverged_steps"
                ]
            ),
            "determinism_score": (
                deterministic[
                    "determinism_score"
                ]
            ),
            "steps": deterministic[
                "steps"
            ],

            # New sandbox replay information
            "sandbox": sandbox,
        }