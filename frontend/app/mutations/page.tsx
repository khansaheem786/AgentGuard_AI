"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Evidence = {
  arguments?: Record<string, unknown>;
  result?: Record<string, unknown>;
  execution_status?: string;
};

type Finding = {
  mutation_id: string;
  mutation_type: string;
  status: string;
  severity: string;
  failure_type: string | null;
  explanation: string;
  recommendation: string;
  evidence: Evidence;
};

type SecurityData = {
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

type EvaluationResponse = {
  agent: string;
  security: SecurityData;
  findings: Finding[];
};

export default function MutationsPage() {
  const [data, setData] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadEvaluation() {
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

      const result: EvaluationResponse = await response.json();

      setData(result);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to AgentGuard backend. Make sure FastAPI is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runEvaluation() {
    setRunning(true);
    setLoading(true);

    try {
      await loadEvaluation();
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    loadEvaluation();
  }, []);

  function toggleMutation(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function severityClass(severity: string) {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-50 text-red-700";
      case "HIGH":
        return "bg-orange-50 text-orange-700";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700";
      case "LOW":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  function statusClass(status: string) {
    return status.toUpperCase() === "PASS"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";
  }

  const totalMutations = data?.security.total_mutations ?? 0;
  const failedMutations = data?.security.failed_mutations ?? 0;
  const blockedMutations = totalMutations - failedMutations;

  const blockRate =
    totalMutations > 0
      ? Math.round((blockedMutations / totalMutations) * 100)
      : 0;

  if (loading && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-10 py-8 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading mutation analysis...
          </p>
        </div>
      </main>
    );
  }

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
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Dashboard
            </Link>

            <Link
              href="/evaluations"
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Evaluations
            </Link>

            <Link
              href="/security"
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Security
            </Link>

            <Link
              href="/mutations"
              className="block rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
            >
              Mutations
            </Link>

            <Link
              href="/reports"
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
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
                Adversarial Testing
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Mutations
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

            {data && (
              <>
                {/* Hero */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                          Mutation Testing
                        </h2>

                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          {data.security.risk_level}
                        </span>
                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Adversarial mutations test whether the agent's security
                        controls can prevent unsafe tool behavior.
                      </p>

                      <p className="mt-3 text-xs font-medium text-slate-400">
                        Agent:{" "}
                        <span className="text-slate-600">
                          {data.agent}
                        </span>
                      </p>
                    </div>

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
                  </div>
                </section>

                {/* Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Total Mutations"
                    value={totalMutations}
                    description="Adversarial test cases"
                  />

                  <MetricCard
                    label="Blocked"
                    value={blockedMutations}
                    description={`${blockRate}% block rate`}
                    valueClass="text-emerald-600"
                  />

                  <MetricCard
                    label="Failed"
                    value={failedMutations}
                    description="Security control failures"
                    valueClass={
                      failedMutations > 0
                        ? "text-red-600"
                        : "text-slate-950"
                    }
                  />

                  <MetricCard
                    label="Penalty"
                    value={data.security.total_penalty}
                    description="Security score penalty"
                  />
                </div>

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

                {/* Results */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="font-bold text-slate-950">
                          Mutation Results
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Detailed results from the latest adversarial
                          evaluation.
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {blockedMutations}/{totalMutations} Blocked
                      </span>
                    </div>
                  </div>

                  {data.findings.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl">
                        —
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        No mutation results
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        No adversarial mutations were returned by the
                        evaluation.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {data.findings.map((finding) => {
                        const isExpanded =
                          expandedId === finding.mutation_id;

                        return (
                          <div key={finding.mutation_id}>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMutation(finding.mutation_id)
                              }
                              className="w-full px-6 py-5 text-left transition hover:bg-slate-50"
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-start gap-4">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                      finding.status.toUpperCase() ===
                                      "PASS"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-red-50 text-red-600"
                                    }`}
                                  >
                                    {finding.status.toUpperCase() ===
                                    "PASS"
                                      ? "✓"
                                      : "!"}
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

                                <div className="flex shrink-0 items-center gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(
                                      finding.status,
                                    )}`}
                                  >
                                    {finding.status}
                                  </span>

                                  <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${severityClass(
                                      finding.severity,
                                    )}`}
                                  >
                                    {finding.severity}
                                  </span>

                                  <span className="ml-1 text-slate-400">
                                    {isExpanded ? "▲" : "▼"}
                                  </span>
                                </div>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="border-t border-slate-100 bg-slate-50 px-6 py-6">
                                <div className="grid gap-5 lg:grid-cols-2">
                                  <InfoCard
                                    title="Mutation Identity"
                                    items={[
                                      [
                                        "Mutation ID",
                                        finding.mutation_id,
                                      ],
                                      [
                                        "Mutation Type",
                                        finding.mutation_type,
                                      ],
                                      [
                                        "Severity",
                                        finding.severity,
                                      ],
                                    ]}
                                  />

                                  <InfoCard
                                    title="Execution"
                                    items={[
                                      [
                                        "Security Decision",
                                        finding.status,
                                      ],
                                      [
                                        "Execution Status",
                                        finding.evidence
                                          ?.execution_status ||
                                          "COMPLETED",
                                      ],
                                      [
                                        "Failure Type",
                                        finding.failure_type ||
                                          "None",
                                      ],
                                    ]}
                                  />
                                </div>

                                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                  <JsonCard
                                    title="Mutated Arguments"
                                    value={
                                      finding.evidence?.arguments ?? {}
                                    }
                                  />

                                  <JsonCard
                                    title="Policy Result"
                                    value={
                                      finding.evidence?.result ?? {}
                                    }
                                  />
                                </div>

                                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                  <TextCard
                                    title="Analysis"
                                    text={finding.explanation}
                                  />

                                  <TextCard
                                    title="Recommendation"
                                    text={finding.recommendation}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Summary */}
                <section
                  className={`rounded-2xl border p-6 ${
                    failedMutations === 0
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm ${
                        failedMutations === 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {failedMutations === 0 ? "✓" : "!"}
                    </div>

                    <div>
                      <h2
                        className={`font-bold ${
                          failedMutations === 0
                            ? "text-emerald-900"
                            : "text-red-900"
                        }`}
                      >
                        {failedMutations === 0
                          ? "All mutation tests were blocked successfully"
                          : `${failedMutations} mutation test${
                              failedMutations === 1 ? "" : "s"
                            } require attention`}
                      </h2>

                      <p
                        className={`mt-1 text-sm leading-6 ${
                          failedMutations === 0
                            ? "text-emerald-800"
                            : "text-red-800"
                        }`}
                      >
                        {failedMutations === 0
                          ? "AgentGuard prevented every current adversarial mutation from reaching an unsafe tool action."
                          : "One or more adversarial mutations were not safely blocked and should be investigated."}
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================= */
/* Reusable UI components                                         */
/* ============================================================= */

function MetricCard({
  label,
  value,
  description,
  valueClass = "text-slate-950",
}: {
  label: string;
  value: number;
  description: string;
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

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-5"
          >
            <span className="text-sm text-slate-500">{label}</span>

            <span className="text-right text-sm font-semibold text-slate-800">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonCard({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function TextCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}
