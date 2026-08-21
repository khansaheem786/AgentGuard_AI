"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ScenarioResult = {
  scenario_id: string;
  scenario_name: string;
  category: string;
  severity: string;
  execution: {
    scenario: string;
    agent: string;
    tool: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
    trace: Record<string, unknown>;
    status: string;
  };
  analysis: {
    scenario_id: string;
    scenario_name: string;
    result: string;
    failure_type: string | null;
    severity: string;
    explanation: string;
    recommendation: string;
    evidence: Record<string, unknown>;
  };
};

type Evaluation = {
  agent: string;

  overall: {
    score: number;
    grade: string;
    risk_level: string;
  };

  reliability: {
    score: number;
    total_tests: number;
    passed: number;
    failed: number;
    review: number;
    pass_rate: number;
  };

  security: {
    total_mutations: number;
    failed_mutations: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
    low_findings: number;
    security_score: number;
    grade: string;
    risk_level: string;
  };

  normal_results: ScenarioResult[];
};

export default function EvaluationsPage() {
  const [data, setData] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [expandedScenario, setExpandedScenario] = useState<string | null>(
    null,
  );

  async function loadEvaluation() {
    try {
      setError("");

      const response = await fetch(
        "https://agentguard-ai-9rbc.onrender.com/api/evaluation/master",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const result = await response.json();

      setData(result);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the AgentGuard backend. Make sure FastAPI is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runEvaluation() {
    setRunning(true);
    setLoading(true);

    await loadEvaluation();

    setRunning(false);
  }

  useEffect(() => {
    loadEvaluation();
  }, []);

  const blockedMutations = data
    ? data.security.total_mutations - data.security.failed_mutations
    : 0;

  function toggleScenario(id: string) {
    setExpandedScenario((current) => (current === id ? null : id));
  }

  function getStatusClasses(status: string) {
    const normalized = status.toUpperCase();

    if (normalized === "PASS" || normalized === "PASSED") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (normalized === "FAIL" || normalized === "FAILED") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  function getSeverityClasses(severity: string) {
    const normalized = severity.toUpperCase();

    if (normalized === "CRITICAL") {
      return "bg-red-50 text-red-700";
    }

    if (normalized === "HIGH") {
      return "bg-orange-50 text-orange-700";
    }

    if (normalized === "MEDIUM") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* ========================================================= */}
        {/* SIDEBAR */}
        {/* ========================================================= */}

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

            <Link
              href="/"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Dashboard
            </Link>

            <Link
              href="/evaluations"
              className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
            >
              Evaluations
            </Link>

            <Link
              href="/security"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Security
            </Link>

            <Link
              href="/mutations"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Mutations
            </Link>

            <Link
              href="/reports"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Reports
            </Link>

          </nav>
        </aside>

        {/* ========================================================= */}
        {/* MAIN */}
        {/* ========================================================= */}

        <section className="min-w-0 flex-1">

          {/* Header */}

          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Agent Evaluation
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Evaluations
              </h1>
            </div>

            <button
              onClick={runEvaluation}
              disabled={running}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Running..." : "Run Evaluation"}
            </button>

          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Loading */}

            {loading && !data ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-medium text-slate-600">
                  Loading latest evaluation...
                </p>

              </div>
            ) : data ? (
              <>

                {/* ===================================================== */}
                {/* AGENT SUMMARY */}
                {/* ===================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                          {data.agent}
                        </h2>

                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          Latest Evaluation
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Complete reliability and security assessment
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Current Risk
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-600">
                        {data.overall.risk_level}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ===================================================== */}
                {/* SCORE CARDS */}
                {/* ===================================================== */}

                <div className="grid gap-4 md:grid-cols-3">

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <p className="text-sm text-slate-500">
                      Overall Score
                    </p>

                    <p className="mt-2 text-4xl font-bold text-slate-950">
                      {data.overall.score}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Grade {data.overall.grade}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <p className="text-sm text-slate-500">
                      Reliability
                    </p>

                    <p className="mt-2 text-4xl font-bold text-blue-600">
                      {data.reliability.score}%
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {data.reliability.passed}/
                      {data.reliability.total_tests} tests passed
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <p className="text-sm text-slate-500">
                      Security
                    </p>

                    <p className="mt-2 text-4xl font-bold text-emerald-600">
                      {data.security.security_score}%
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {blockedMutations}/
                      {data.security.total_mutations} mutations blocked
                    </p>

                  </div>

                </div>

                {/* ===================================================== */}
                {/* EVALUATION BREAKDOWN */}
                {/* ===================================================== */}

                <div className="grid gap-6 lg:grid-cols-2">

                  {/* Functional */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="font-bold text-slate-950">
                      Functional Evaluation
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Normal scenario execution
                    </p>

                    <div className="mt-6 grid grid-cols-3 gap-3">

                      <div className="rounded-xl bg-emerald-50 p-4">
                        <p className="text-2xl font-bold text-emerald-700">
                          {data.reliability.passed}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Passed
                        </p>
                      </div>

                      <div className="rounded-xl bg-red-50 p-4">
                        <p className="text-2xl font-bold text-red-700">
                          {data.reliability.failed}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Failed
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-2xl font-bold text-slate-700">
                          {data.reliability.review}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Review
                        </p>
                      </div>

                    </div>

                    <div className="mt-6">

                      <div className="mb-2 flex justify-between text-xs">

                        <span className="font-medium text-slate-500">
                          Pass rate
                        </span>

                        <span className="font-bold text-blue-600">
                          {data.reliability.pass_rate}%
                        </span>

                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${data.reliability.pass_rate}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                  {/* Security */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="font-bold text-slate-950">
                      Security Evaluation
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Adversarial mutation resistance
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                      <div className="rounded-xl bg-red-50 p-4">
                        <p className="text-2xl font-bold text-red-700">
                          {data.security.critical_findings}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Critical
                        </p>
                      </div>

                      <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-2xl font-bold text-orange-700">
                          {data.security.high_findings}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          High
                        </p>
                      </div>

                      <div className="rounded-xl bg-yellow-50 p-4">
                        <p className="text-2xl font-bold text-yellow-700">
                          {data.security.medium_findings}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Medium
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-4">
                        <p className="text-2xl font-bold text-emerald-700">
                          {blockedMutations}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Blocked
                        </p>
                      </div>

                    </div>

                    <div className="mt-6">

                      <div className="mb-2 flex justify-between text-xs">

                        <span className="font-medium text-slate-500">
                          Security score
                        </span>

                        <span className="font-bold text-emerald-600">
                          {data.security.security_score}%
                        </span>

                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{
                            width: `${data.security.security_score}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>

                {/* ===================================================== */}
                {/* REAL SCENARIOS */}
                {/* ===================================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-6">

                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                      <div>
                        <h2 className="font-bold text-slate-950">
                          Evaluation Scenarios
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Detailed results from the five functional scenarios
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {data.normal_results.length} scenarios
                      </span>

                    </div>

                  </div>

                  <div className="divide-y divide-slate-100">

                    {data.normal_results.map((scenario) => {

                      const expanded =
                        expandedScenario === scenario.scenario_id;

                      const status =
                        scenario.analysis.result ||
                        scenario.execution.status;

                      return (
                        <div key={scenario.scenario_id}>

                          {/* Scenario row */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleScenario(scenario.scenario_id)
                            }
                            className="w-full px-6 py-5 text-left transition hover:bg-slate-50"
                          >

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                              <div className="flex min-w-0 items-start gap-4">

                                <div
                                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                    status === "PASS"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : status === "FAIL"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  {status === "PASS"
                                    ? "✓"
                                    : status === "FAIL"
                                      ? "!"
                                      : "?"}
                                </div>

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <span className="font-mono text-xs font-bold text-slate-500">
                                      {scenario.scenario_id}
                                    </span>

                                    <h3 className="font-semibold text-slate-950">
                                      {scenario.scenario_name}
                                    </h3>

                                  </div>

                                  <div className="mt-2 flex flex-wrap items-center gap-2">

                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                      {scenario.category}
                                    </span>

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getSeverityClasses(
                                        scenario.severity,
                                      )}`}
                                    >
                                      {scenario.severity}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                      Tool:
                                    </span>

                                    <code className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                      {scenario.execution.tool}
                                    </code>

                                  </div>

                                </div>

                              </div>

                              <div className="flex shrink-0 items-center gap-3">

                                <span
                                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                                    status,
                                  )}`}
                                >
                                  {status}
                                </span>

                                <span className="text-slate-400">
                                  {expanded ? "▲" : "▼"}
                                </span>

                              </div>

                            </div>

                          </button>

                          {/* Expanded details */}

                          {expanded && (
                            <div className="border-t border-slate-100 bg-slate-50 px-6 py-6">

                              <div className="grid gap-5 lg:grid-cols-2">

                                {/* Expected behavior */}

                                <div className="rounded-xl border border-slate-200 bg-white p-5">

                                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Expected Behavior
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {scenario.analysis.evidence
                                      ?.expected_behavior
                                      ? String(
                                          scenario.analysis.evidence
                                            .expected_behavior,
                                        )
                                      : "No expected behavior provided."}
                                  </p>

                                </div>

                                {/* Execution */}

                                <div className="rounded-xl border border-slate-200 bg-white p-5">

                                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Execution
                                  </p>

                                  <div className="mt-3 space-y-2 text-sm">

                                    <div className="flex justify-between gap-4">
                                      <span className="text-slate-500">
                                        Status
                                      </span>

                                      <span className="font-semibold text-slate-900">
                                        {scenario.execution.status}
                                      </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                      <span className="text-slate-500">
                                        Tool
                                      </span>

                                      <code className="font-medium text-slate-700">
                                        {scenario.execution.tool}
                                      </code>
                                    </div>

                                  </div>

                                </div>

                                {/* Arguments */}

                                <div className="rounded-xl border border-slate-200 bg-white p-5">

                                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Arguments
                                  </p>

                                  <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                                    {JSON.stringify(
                                      scenario.execution.arguments,
                                      null,
                                      2,
                                    )}
                                  </pre>

                                </div>

                                {/* Result */}

                                <div className="rounded-xl border border-slate-200 bg-white p-5">

                                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Tool Result
                                  </p>

                                  <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                                    {JSON.stringify(
                                      scenario.execution.result,
                                      null,
                                      2,
                                    )}
                                  </pre>

                                </div>

                              </div>

                              {/* Analysis */}

                              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                                  <div>

                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Failure Analysis
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                      {scenario.analysis.explanation}
                                    </p>

                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                                      scenario.analysis.result,
                                    )}`}
                                  >
                                    {scenario.analysis.result}
                                  </span>

                                </div>

                                {scenario.analysis.failure_type && (
                                  <div className="mt-4">

                                    <p className="text-xs font-semibold text-slate-500">
                                      Failure Type
                                    </p>

                                    <code className="mt-1 inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                                      {scenario.analysis.failure_type}
                                    </code>

                                  </div>
                                )}

                                <div className="mt-4 rounded-lg bg-slate-50 p-4">

                                  <p className="text-xs font-semibold text-slate-500">
                                    Recommendation
                                  </p>

                                  <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {scenario.analysis.recommendation}
                                  </p>

                                </div>

                              </div>

                              {/* Trace */}

                              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                  Execution Trace
                                </p>

                                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                                  {JSON.stringify(
                                    scenario.execution.trace,
                                    null,
                                    2,
                                  )}
                                </pre>

                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}

                  </div>

                </section>

              </>
            ) : null}

          </div>

        </section>
      </div>
    </main>
  );
}

