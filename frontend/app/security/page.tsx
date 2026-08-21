"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Finding = {
  mutation_id: string;
  mutation_type: string;
  status: string;
  severity: string;
  failure_type: string | null;
  explanation: string;
  recommendation: string;
  evidence: {
    arguments?: Record<string, unknown>;
    result?: Record<string, unknown>;
    execution_status?: string;
  };
};

type Evaluation = {
  agent: string;
  overall: {
    score: number;
    grade: string;
    risk_level: string;
  };
  security: {
    base_scenario_id: string;
    base_scenario_name: string;
    total_mutations: number;
    failed_mutations: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
    low_findings: number;
    total_penalty: number;
    security_score: number;
    grade: string;
    risk_level: string;
  };
  findings: Finding[];
};

export default function SecurityPage() {
  const [data, setData] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function loadSecurity() {
    try {
      setError("");

      const response = await fetch(
        "https://agent-guard-ai-sv9r.vercel.app/api/evaluation/master",
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
    } catch (err) {
      console.error(err);

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

    await loadSecurity();

    setRunning(false);
  }

  useEffect(() => {
    loadSecurity();
  }, []);

  function toggleFinding(id: string) {
    setExpanded((current) => (current === id ? null : id));
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

  const blocked = data
    ? data.security.total_mutations - data.security.failed_mutations
    : 0;

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

            <Link
              href="/"
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Dashboard
            </Link>

            <Link
              href="/evaluations"
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Evaluations
            </Link>

            <Link
              href="/security"
              className="flex w-full items-center rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
            >
              Security
            </Link>

            <Link
              href="/mutations"
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Mutations
            </Link>

            <Link
              href="/reports"
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Reports
            </Link>

          </nav>
        </aside>

        {/* Main */}

        <section className="min-w-0 flex-1">

          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Agent Security
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Security
              </h1>
            </div>

            <button
              type="button"
              onClick={runEvaluation}
              disabled={running}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Running..." : "Run Evaluation"}
            </button>

          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading && !data ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-medium text-slate-600">
                  Loading security assessment...
                </p>
              </div>
            ) : data ? (
              <>

                {/* Security posture */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                    <div>
                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                          Security Posture
                        </h2>

                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          {data.security.risk_level}
                        </span>

                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Mutation-based adversarial assessment of{" "}
                        <span className="font-semibold text-slate-700">
                          {data.agent}
                        </span>
                        .
                      </p>
                    </div>

                    <div className="flex items-center gap-5">

                      <div className="text-right">

                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Security Score
                        </p>

                        <p className="mt-1 text-4xl font-bold text-emerald-600">
                          {data.security.security_score}
                        </p>

                        <p className="text-xs font-semibold text-slate-500">
                          Grade {data.security.grade}
                        </p>

                      </div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                        🛡
                      </div>

                    </div>

                  </div>

                </section>

                {/* Metrics */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Mutations
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {data.security.total_mutations}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Total adversarial tests
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Blocked
                    </p>

                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                      {blocked}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Safely handled
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Failed
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-600">
                      {data.security.failed_mutations}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Security failures
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Penalty
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {data.security.total_penalty}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Total security penalty
                    </p>
                  </div>

                </div>

                {/* Severity overview */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Findings Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Severity distribution from the latest mutation run
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                        Critical
                      </p>

                      <p className="mt-2 text-3xl font-bold text-red-700">
                        {data.security.critical_findings}
                      </p>
                    </div>

                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                        High
                      </p>

                      <p className="mt-2 text-3xl font-bold text-orange-700">
                        {data.security.high_findings}
                      </p>
                    </div>

                    <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-yellow-600">
                        Medium
                      </p>

                      <p className="mt-2 text-3xl font-bold text-yellow-700">
                        {data.security.medium_findings}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Low
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-700">
                        {data.security.low_findings}
                      </p>
                    </div>

                  </div>

                </section>

                {/* Base scenario */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Mutation Base Scenario
                  </p>

                  <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                    <div>

                      <h2 className="text-lg font-bold text-slate-950">
                        {data.security.base_scenario_name}
                      </h2>

                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {data.security.base_scenario_id}
                      </p>

                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      Mutation Target
                    </span>

                  </div>

                </section>

                {/* Mutation findings */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-6">

                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                      <div>

                        <h2 className="font-bold text-slate-950">
                          Security Findings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Mutation-level security analysis
                        </p>

                      </div>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {data.findings.length} Findings
                      </span>

                    </div>

                  </div>

                  {data.findings.length === 0 ? (

                    <div className="p-14 text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                        🛡
                      </div>

                      <h3 className="mt-5 font-bold text-slate-950">
                        No security findings
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        All current mutation tests were handled safely.
                        No critical, high, medium, or low findings were
                        generated.
                      </p>

                    </div>

                  ) : (

                    <div className="divide-y divide-slate-100">

                      {data.findings.map((finding) => {

                        const isExpanded =
                          expanded === finding.mutation_id;

                        return (
                          <div key={finding.mutation_id}>

                            <button
                              type="button"
                              onClick={() =>
                                toggleFinding(finding.mutation_id)
                              }
                              className="w-full px-6 py-5 text-left transition hover:bg-slate-50"
                            >

                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div className="flex min-w-0 items-start gap-4">

                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    ✓
                                  </div>

                                  <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-2">

                                      <span className="font-mono text-xs font-bold text-slate-500">
                                        {finding.mutation_id}
                                      </span>

                                      <h3 className="font-semibold text-slate-950">
                                        {finding.mutation_type}
                                      </h3>

                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                      {finding.explanation}
                                    </p>

                                  </div>

                                </div>

                                <div className="flex shrink-0 items-center gap-3">

                                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                    {finding.status}
                                  </span>

                                  <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${getSeverityClasses(
                                      finding.severity,
                                    )}`}
                                  >
                                    {finding.severity}
                                  </span>

                                  <span className="text-slate-400">
                                    {isExpanded ? "▲" : "▼"}
                                  </span>

                                </div>

                              </div>

                            </button>

                            {isExpanded && (
                              <div className="border-t border-slate-100 bg-slate-50 px-6 py-6">

                                <div className="grid gap-5 lg:grid-cols-2">

                                  <div className="rounded-xl border border-slate-200 bg-white p-5">

                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Failure Type
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                      {finding.failure_type ||
                                        "None — safely handled"}
                                    </p>

                                  </div>

                                  <div className="rounded-xl border border-slate-200 bg-white p-5">

                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Execution Status
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                                      {finding.evidence
                                        ?.execution_status ||
                                        "Completed"}
                                    </p>

                                  </div>

                                </div>

                                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Security Explanation
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {finding.explanation}
                                  </p>

                                </div>

                                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Recommendation
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {finding.recommendation}
                                  </p>

                                </div>

                                <div className="mt-5 grid gap-5 lg:grid-cols-2">

                                  <div className="rounded-xl border border-slate-200 bg-white p-5">

                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Mutation Arguments
                                    </p>

                                    <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                                      {JSON.stringify(
                                        finding.evidence?.arguments ?? {},
                                        null,
                                        2,
                                      )}
                                    </pre>

                                  </div>

                                  <div className="rounded-xl border border-slate-200 bg-white p-5">

                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                      Policy Result
                                    </p>

                                    <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                                      {JSON.stringify(
                                        finding.evidence?.result ?? {},
                                        null,
                                        2,
                                      )}
                                    </pre>

                                  </div>

                                </div>

                              </div>
                            )}

                          </div>
                        );
                      })}

                    </div>
                  )}

                </section>

              </>
            ) : null}

          </div>
        </section>
      </div>
    </main>
  );
}
