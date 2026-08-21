"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Scenario = {
  id: string;
  name: string;
  category: string;
  severity: string;
  description: string;
  steps: {
    step_id: number;
    tool_name: string;
    arguments: Record<string, unknown>;
    expected_behavior: string;
  }[];
};

type ExecutionStep = {
  step_id: number;
  trace_id: string;
  tool: string;
  arguments: Record<string, unknown>;
  expected_behavior: string;
  result: {
    status: string;
    tool: string;
    arguments?: Record<string, unknown>;
    policy?: {
      allowed: boolean;
      status: string;
      reason: string | null;
      message: string;
      severity: string;
    };
    result?: Record<string, unknown>;
  };
};

type AnalysisStep = {
  step_id: number;
  tool: string;
  status: string;
  failure_type: string | null;
  severity: string;
  explanation: string;
  recommendation: string;
  evidence: {
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
  };
};

type RunResult = {
  scenario: {
    id: string;
    name: string;
    category: string;
    severity: string;
    description: string;
  };
  execution: {
    scenario_id: string;
    total_steps: number;
    steps: ExecutionStep[];
    status: string;
  };
  analysis: {
    scenario_id: string;
    scenario_name: string;
    overall_status: string;
    total_steps: number;
    passed_steps: number;
    failed_steps: number;
    steps: AnalysisStep[];
  };
};

type ReplayStep = {
  replay_step_id: number;
  original_step_id: number;
  original_trace_id: string | null;
  replay_trace_id: string;
  tool: string;
  arguments: Record<string, unknown>;
  original_result: Record<string, unknown>;
  replay_result: Record<string, unknown>;
  original_fingerprint: string;
  replay_fingerprint: string;
  status: "MATCH" | "DIVERGED";
};

type ReplayResult = {
  scenario_id: string;
  replay_status: string;
  execution_mode: string;
  total_steps: number;
  matched_steps: number;
  diverged_steps: number;
  determinism_score: number;
  steps: ReplayStep[];
};

function severityClass(severity: string) {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-50 text-red-700";
    case "HIGH":
      return "bg-orange-50 text-orange-700";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function executionClass(status: string) {
  return status.toUpperCase() === "BLOCKED"
    ? "bg-red-50 text-red-700"
    : "bg-emerald-50 text-emerald-700";
}

function analysisClass(status: string) {
  return status.toUpperCase() === "FAIL"
    ? "bg-red-50 text-red-700"
    : "bg-emerald-50 text-emerald-700";
}

export default function MultiStepPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
const [replay, setReplay] = useState<ReplayResult | null>(null);
const [replaying, setReplaying] = useState(false);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function loadScenarios() {
    try {
      setError("");

      const response = await fetch(
        "https://agent-guard-ai-sv9r.vercel.app/api/multistep/scenarios",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      setScenarios(data.scenarios ?? []);

      if (data.scenarios?.length > 0) {
        setSelectedId(data.scenarios[0].id);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load multi-step scenarios. Make sure FastAPI is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runScenario(scenarioId: string) {
    if (running) return;

    setRunning(true);
    setError("");
    setResult(null);
    setSelectedId(scenarioId);

    try {
      const response = await fetch(
        `https://agent-guard-ai-sv9r.vercel.app/api/multistep/run/${scenarioId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Scenario execution failed with status ${response.status}`);
      }

      const data: RunResult = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to execute the multi-step scenario. Make sure the AgentGuard backend is running.",
      );
    } finally {
      setRunning(false);
    }
  }

async function runReplay(scenarioId: string) {
  if (replaying) return;

  setReplaying(true);
  setError("");
  setReplay(null);
  setSelectedId(scenarioId);

  try {
    const response = await fetch(
      `https://agent-guard-ai-sv9r.vercel.app/api/replay/run/${scenarioId}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Replay failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    setReplay(data.replay);
  } catch (err) {
    console.error(err);

    setError(
      "Unable to run deterministic replay. Make sure the AgentGuard backend is running.",
    );
  } finally {
    setReplaying(false);
  }
}


  useEffect(() => {
    loadScenarios();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              🛡
            </div>

            <div>
              <p className="font-bold tracking-tight text-slate-950">
                AgentGuard
              </p>

              <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                AI SECURITY PLATFORM
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>

            <NavItem href="/" label="Dashboard" />
            <NavItem href="/evaluations" label="Evaluations" />
            <NavItem href="/security" label="Security" />
            <NavItem href="/mutations" label="Mutations" />
            <NavItem href="/multistep" label="Multi-Step" active />
            <NavItem href="/reports" label="Reports" />
          </nav>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Agent Workflow Testing
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Multi-Step Evaluation
              </h1>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Intro */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Stateful Agent Evaluation
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Evaluate agent behavior across multiple tool calls
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                AgentGuard executes complete workflows step-by-step, records
                every tool interaction, applies security policies, and analyzes
                the resulting execution trace.
              </p>
            </section>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-medium text-slate-600">
                  Loading multi-step scenarios...
                </p>
              </div>
            ) : (
              <>
                {/* Scenario list */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <h2 className="font-bold text-slate-950">
                      Available Scenarios
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Select a workflow to execute against AgentGuard.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className={`p-6 transition ${
                          selectedId === scenario.id
                            ? "bg-blue-50/40"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-400">
                                {scenario.id}
                              </span>

                              <h3 className="font-semibold text-slate-950">
                                {scenario.name}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${severityClass(
                                  scenario.severity,
                                )}`}
                              >
                                {scenario.severity}
                              </span>
                            </div>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {scenario.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                {scenario.category}
                              </span>

                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                {scenario.steps.length} steps
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={running}
                            onClick={() => runScenario(scenario.id)}
                            className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {running && selectedId === scenario.id
                              ? "Running..."
                              : "Run Scenario"}
                          </button>
			<button
  type="button"
  disabled={running || replaying}
  onClick={() => runReplay(scenario.id)}
  className="shrink-0 rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  {replaying && selectedId === scenario.id
    ? "Replaying..."
    : "Replay"}
</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Execution result */}
                {result && (
                  <>
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              {result.scenario.id}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-bold ${severityClass(
                                result.scenario.severity,
                              )}`}
                            >
                              {result.scenario.severity}
                            </span>
                          </div>

                          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                            {result.scenario.name}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {result.scenario.description}
                          </p>
                        </div>

                        <div
                          className={`rounded-xl px-4 py-3 text-center ${
                            result.analysis.overall_status === "FAIL"
                              ? "bg-red-50"
                              : "bg-emerald-50"
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60">
                            Agent Analysis
                          </p>

                          <p
                            className={`mt-1 text-lg font-bold ${
                              result.analysis.overall_status === "FAIL"
                                ? "text-red-700"
                                : "text-emerald-700"
                            }`}
                          >
                            {result.analysis.overall_status}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Summary */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <SummaryCard
                        label="Total Steps"
                        value={result.analysis.total_steps}
                      />

                      <SummaryCard
                        label="Passed"
                        value={result.analysis.passed_steps}
                        valueClass="text-emerald-600"
                      />

                      <SummaryCard
                        label="Failed"
                        value={result.analysis.failed_steps}
                        valueClass={
                          result.analysis.failed_steps > 0
                            ? "text-red-600"
                            : "text-slate-950"
                        }
                      />
                    </div>

                    {/* Trace */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 p-6">
                        <h2 className="font-bold text-slate-950">
                          Execution Trace
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Step-by-step tool execution and policy decisions.
                        </p>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {result.execution.steps.map((step) => {
                          const analysis = result.analysis.steps.find(
                            (item) => item.step_id === step.step_id,
                          );

                          const policy = step.result.policy;

                          return (
                            <div
                              key={step.step_id}
                              className="p-6"
                            >
                              <div className="flex flex-col gap-5 xl:flex-row">
                                {/* Step number */}
                                <div className="flex shrink-0 items-start gap-4 xl:w-44">
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                                      step.result.status === "BLOCKED"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-emerald-50 text-emerald-700"
                                    }`}
                                  >
                                    {step.step_id}
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                      Step
                                    </p>

                                    <p className="mt-1 font-mono text-xs font-bold text-slate-600">
                                      {step.trace_id}
                                    </p>
                                  </div>
                                </div>

                                {/* Tool */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-mono text-sm font-bold text-slate-950">
                                      {step.tool}
                                    </h3>

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${executionClass(
                                        step.result.status,
                                      )}`}
                                    >
                                      {step.result.status}
                                    </span>

                                    {analysis && (
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${analysisClass(
                                          analysis.status,
                                        )}`}
                                      >
                                        ANALYSIS {analysis.status}
                                      </span>
                                    )}

                                    {policy?.severity && (
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${severityClass(
                                          policy.severity,
                                        )}`}
                                      >
                                        {policy.severity}
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Arguments
                                      </p>

                                      <pre className="mt-2 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                                        {JSON.stringify(
                                          step.arguments,
                                          null,
                                          2,
                                        )}
                                      </pre>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Policy Decision
                                      </p>

                                      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-sm font-semibold text-slate-800">
                                          {policy?.status ??
                                            step.result.status}
                                        </p>

                                        {policy?.reason && (
                                          <p className="mt-1 font-mono text-xs text-red-600">
                                            {policy.reason}
                                          </p>
                                        )}

                                        {policy?.message && (
                                          <p className="mt-2 text-xs leading-5 text-slate-500">
                                            {policy.message}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {analysis && (
                                    <div
                                      className={`mt-4 rounded-xl p-4 ${
                                        analysis.status === "FAIL"
                                          ? "bg-red-50"
                                          : "bg-emerald-50"
                                      }`}
                                    >
                                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60">
                                        Analysis
                                      </p>

                                      <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {analysis.explanation}
                                      </p>

                                      {analysis.recommendation && (
                                        <p className="mt-2 text-xs leading-5 text-slate-500">
                                          <span className="font-semibold">
                                            Recommendation:
                                          </span>{" "}
                                          {analysis.recommendation}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
{/* Deterministic Replay */}
{replay && (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
            Deterministic Execution
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
            Replay Verification
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recorded execution was reconstructed without executing the
            tools again.
          </p>
        </div>

        <div
          className={`rounded-xl px-5 py-3 text-center ${
            replay.replay_status === "REPLAY_SUCCESS"
              ? "bg-emerald-50"
              : "bg-red-50"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60">
            Replay Status
          </p>

          <p
            className={`mt-1 text-lg font-bold ${
              replay.replay_status === "REPLAY_SUCCESS"
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {replay.replay_status === "REPLAY_SUCCESS"
              ? "SUCCESS"
              : "DIVERGED"}
          </p>
        </div>
      </div>
    </div>

    {/* Replay metrics */}
    <div className="grid gap-4 p-6 sm:grid-cols-4">
      <ReplayMetric
        label="Determinism"
        value={`${replay.determinism_score}%`}
        valueClass={
          replay.determinism_score === 100
            ? "text-emerald-600"
            : "text-red-600"
        }
      />

      <ReplayMetric
        label="Total Steps"
        value={replay.total_steps}
      />

      <ReplayMetric
        label="Matched"
        value={replay.matched_steps}
        valueClass="text-emerald-600"
      />

      <ReplayMetric
        label="Diverged"
        value={replay.diverged_steps}
        valueClass={
          replay.diverged_steps > 0
            ? "text-red-600"
            : "text-slate-950"
        }
      />
    </div>

    {/* Replay steps */}
    <div className="border-t border-slate-100">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="font-bold text-slate-950">
          Replay Comparison
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Original execution versus deterministic reconstruction.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {replay.steps.map((step) => (
          <div
            key={step.replay_step_id}
            className="p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                    step.status === "MATCH"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {step.replay_step_id}
                </div>

                <div>
                  <p className="font-mono text-sm font-bold text-slate-950">
                    {step.tool}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="font-mono text-[11px] text-slate-400">
                      Original: {step.original_trace_id ?? "N/A"}
                    </span>

                    <span className="font-mono text-[11px] text-blue-500">
                      Replay: {step.replay_trace_id}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  step.status === "MATCH"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {step.status}
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Original Result
                </p>

                <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-200">
                  {JSON.stringify(
                    step.original_result,
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Replay Result
                </p>

                <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-200">
                  {JSON.stringify(
                    step.replay_result,
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Original Fingerprint
                  </p>

                  <p className="mt-1 break-all font-mono text-[10px] text-slate-500">
                    {step.original_fingerprint}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Replay Fingerprint
                  </p>

                  <p className="mt-1 break-all font-mono text-[10px] text-slate-500">
                    {step.replay_fingerprint}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Determinism conclusion */}
    <div
      className={`border-t p-6 ${
        replay.replay_status === "REPLAY_SUCCESS"
          ? "border-emerald-100 bg-emerald-50"
          : "border-red-100 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
          {replay.replay_status === "REPLAY_SUCCESS"
            ? "✓"
            : "!"}
        </div>

        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
              replay.replay_status === "REPLAY_SUCCESS"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            Deterministic Verification
          </p>

          <h3 className="mt-1 font-bold text-slate-950">
            {replay.replay_status === "REPLAY_SUCCESS"
              ? "Execution was reproduced deterministically."
              : "Execution drift was detected."}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {replay.matched_steps} of {replay.total_steps} steps
            matched the original execution.
          </p>
        </div>
      </div>
    </div>
  </section>
)}
                    {/* Security interpretation */}
                    <section
                      className={`rounded-2xl border p-6 ${
                        result.execution.steps.some(
                          (step) => step.result.status === "BLOCKED",
                        )
                          ? "border-emerald-100 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                          🛡
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                            AgentGuard Security Decision
                          </p>

                          {result.execution.steps.some(
                            (step) => step.result.status === "BLOCKED",
                          ) ? (
                            <>
                              <h2 className="mt-1 font-bold text-emerald-950">
                                Unsafe tool behavior was successfully blocked.
                              </h2>

                              <p className="mt-2 text-sm leading-6 text-emerald-800">
                                The agent attempted a prohibited action, but
                                the Guarded Executor and Policy Engine stopped
                                the tool call before unsafe execution.
                              </p>
                            </>
                          ) : (
                            <>
                              <h2 className="mt-1 font-bold text-slate-950">
                                No tool call was blocked in this workflow.
                              </h2>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                All tool calls completed without triggering a
                                security block.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function NavItem({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  valueClass = "text-slate-950",
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
function ReplayMetric({
  label,
  value,
  valueClass = "text-slate-950",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
