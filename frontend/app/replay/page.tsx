"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MasterResponse = {
  agent: string;

  overall: {
    score: number;
    grade: string;
    risk_level: string;
  };

  reliability: {
    score: number;
    grade: string;
    total_tests: number;
    passed: number;
    failed: number;
    [key: string]: unknown;
  };

  security: {
    security_score: number;
    grade: string;
    risk_level: string;
    campaign_status: string;
    total_scenarios: number;
    total_mutations: number;
    blocked_mutations: number;
    failed_mutations: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
    low_findings: number;
    total_penalty: number;
    [key: string]: unknown;
  };

  multistep_security: {
    total_scenarios: number;
    total_steps: number;
    passed_steps: number;
    failed_steps: number;
    attacks_detected: number;
    attacks_blocked: number;
    unblocked_attacks: number;
    security_score: number;
    grade: string;
    risk_level: string;
    scenarios?: unknown[];
    [key: string]: unknown;
  };

  summary: {
    normal_tests: number;
    normal_passed: number;
    normal_failed: number;
    mutation_tests: number;
    mutation_blocked: number;
    mutation_failed: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
    low_findings: number;
    [key: string]: unknown;
  };

  findings: unknown[];

  normal_results: Array<{
    scenario_id: string;
    scenario_name: string;
    category: string;
    severity: string;
    execution?: unknown;
    analysis?: {
      result?: string;
      failure_type?: string | null;
      severity?: string;
      explanation?: string;
      recommendation?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://agent-guard-ai-sv9r.vercel.app";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: "▦",
  },
  {
    href: "/evaluations",
    label: "Evaluations",
    icon: "✓",
  },
  {
    href: "/security",
    label: "Security",
    icon: "◈",
  },
  {
    href: "/mutations",
    label: "Mutations",
    icon: "⌁",
  },
  {
    href: "/multistep",
    label: "Multi-Step",
    icon: "↗",
  },
  {
    href: "/replay",
    label: "Replay",
    icon: "↻",
  },
  {
    href: "/reports",
    label: "Reports",
    icon: "▤",
  },
];

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-slate-100 px-5 py-5">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <span className="text-lg font-black">
              A
            </span>
          </div>

          <div>
            <p className="text-sm font-black tracking-tight text-slate-950">
              AgentGuard
            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              AI Security Platform
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                    active
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-bold text-slate-700">
              AgentGuard Online
            </span>
          </div>

          <p className="mt-1 text-[10px] text-slate-400">
            Security evaluation environment
          </p>
        </div>
      </div>
    </aside>
  );
}

function MetricCard({
  label,
  value,
  description,
  className = "text-slate-950",
}: {
  label: string;
  value: string | number;
  description: string;
  className?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-black ${className}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  grade,
  risk,
}: {
  title: string;
  score: number;
  grade: string;
  risk: string;
}) {
  const normalizedRisk = risk.toUpperCase();

  const riskClass =
    normalizedRisk === "LOW"
      ? "bg-emerald-50 text-emerald-700"
      : normalizedRisk === "MODERATE"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black text-slate-950">
            {Number(score).toFixed(1)}
          </p>
        </div>

        <span className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
          {grade}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">
          Risk Level
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${riskClass}`}
        >
          {risk}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-950 transition-all duration-700"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, Number(score)),
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-black text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function severityClass(severity: string) {
  const value = severity.toUpperCase();

  if (value === "CRITICAL") {
    return "bg-red-50 text-red-700";
  }

  if (value === "HIGH") {
    return "bg-orange-50 text-orange-700";
  }

  if (value === "MEDIUM") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

function resultClass(result: string) {
  const value = result.toUpperCase();

  if (value === "PASS") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value === "FAIL" ||
    value === "FAILED"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function DashboardPage() {
  const [data, setData] =
    useState<MasterResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/evaluation/master`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        let message =
          `Dashboard request failed (${response.status})`;

        try {
          const body = await response.json();

          if (
            typeof body?.detail === "string"
          ) {
            message = body.detail;
          }
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      const result: MasterResponse =
        await response.json();

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load AgentGuard dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const passedRate = useMemo(() => {
    if (!data?.reliability?.total_tests) {
      return 0;
    }

    return (
      (data.reliability.passed /
        data.reliability.total_tests) *
      100
    );
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="min-h-screen lg:pl-64">
          <div className="flex min-h-screen items-center justify-center px-6">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

              <p className="mt-4 text-sm font-semibold text-slate-600">
                Running AgentGuard evaluation...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="min-h-screen lg:pl-64">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">
                Dashboard Error
              </p>

              <h1 className="mt-2 text-2xl font-black">
                Unable to load AgentGuard
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                {error ||
                  "No evaluation data was returned."}
              </p>

              <button
                type="button"
                onClick={loadDashboard}
                className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                Retry Evaluation
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const overallScore =
    Number(data.overall.score) || 0;

  const reliabilityScore =
    Number(data.reliability.score) || 0;

  const securityScore =
    Number(data.security.security_score) || 0;

  const multistepScore =
    Number(
      data.multistep_security.security_score,
    ) || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />

      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-700">
                  AgentGuard / Command Center
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  AI Security Dashboard
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  Unified security, reliability, adversarial
                  evaluation, multi-step protection, and
                  replay posture for your AI agent.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Protected Agent
                </p>

                <p className="mt-1 text-sm font-black text-slate-900">
                  {data.agent}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-[11px] font-semibold text-slate-500">
                    Evaluation engine online
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Overall posture */}
          <section className="mb-8 rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Overall Security Posture
                </p>

                <div className="mt-3 flex items-end gap-3">
                  <span className="text-6xl font-black tracking-tight">
                    {overallScore.toFixed(1)}
                  </span>

                  <span className="pb-2 text-xl font-bold text-slate-400">
                    / 100
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-black">
                    Grade {data.overall.grade}
                  </span>

                  <span className="rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-bold text-emerald-300">
                    {data.overall.risk_level} RISK
                  </span>
                </div>
              </div>

              <div className="max-w-md">
                <p className="text-sm leading-6 text-slate-400">
                  AgentGuard combines functional reliability
                  and adversarial security into a conservative
                  overall posture. Security failures cannot be
                  hidden by strong functional performance.
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, overallScore),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Core scores */}
          <section className="mb-8 grid gap-4 lg:grid-cols-3">
            <ScoreCard
              title="Reliability"
              score={reliabilityScore}
              grade={data.reliability.grade}
              risk={
                reliabilityScore >= 90
                  ? "LOW"
                  : reliabilityScore >= 70
                    ? "MODERATE"
                    : "HIGH"
              }
            />

            <ScoreCard
              title="Security"
              score={securityScore}
              grade={data.security.grade}
              risk={data.security.risk_level}
            />

            <ScoreCard
              title="Multi-Step Security"
              score={multistepScore}
              grade={data.multistep_security.grade}
              risk={
                data.multistep_security.risk_level
              }
            />
          </section>

          {/* Operational metrics */}
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Normal Tests"
              value={data.summary.normal_tests}
              description={`${data.summary.normal_passed} passed / ${data.summary.normal_failed} failed`}
            />

            <MetricCard
              label="Mutations"
              value={data.summary.mutation_tests}
              description={`${data.summary.mutation_blocked} blocked`}
            />

            <MetricCard
              label="Attacks Detected"
              value={
                data.multistep_security
                  .attacks_detected
              }
              description={`${data.multistep_security.attacks_blocked} blocked`}
              className="text-red-600"
            />

            <MetricCard
              label="Unblocked Attacks"
              value={
                data.multistep_security
                  .unblocked_attacks
              }
              description="Multi-step security exposure"
              className={
                data.multistep_security
                  .unblocked_attacks > 0
                  ? "text-red-600"
                  : "text-emerald-600"
              }
            />
          </section>

          {/* Evaluation coverage */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                title="Evaluation Coverage"
                description="Current functional and adversarial test coverage."
              />

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Functional Reliability
                    </span>

                    <span className="text-sm font-black text-slate-950">
                      {passedRate.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, passedRate),
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Mutation Blocking
                    </span>

                    <span className="text-sm font-black text-slate-950">
                      {data.security.total_mutations
                        ? (
                            (data.security
                              .blocked_mutations /
                              data.security
                                .total_mutations) *
                            100
                          ).toFixed(0)
                        : 100}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-950"
                      style={{
                        width: `${
                          data.security
                            .total_mutations
                            ? Math.min(
                                100,
                                (data.security
                                  .blocked_mutations /
                                  data.security
                                    .total_mutations) *
                                  100,
                              )
                            : 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Multi-Step Protection
                    </span>

                    <span className="text-sm font-black text-slate-950">
                      {multistepScore.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            multistepScore,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Findings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                title="Security Findings"
                description="Severity distribution from the latest campaign."
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                    Critical
                  </p>

                  <p className="mt-2 text-3xl font-black text-red-700">
                    {data.security.critical_findings}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                    High
                  </p>

                  <p className="mt-2 text-3xl font-black text-orange-700">
                    {data.security.high_findings}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Medium
                  </p>

                  <p className="mt-2 text-3xl font-black text-amber-700">
                    {data.security.medium_findings}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Low
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-700">
                    {data.security.low_findings}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Penalty
                </span>

                <span className="font-black text-slate-900">
                  {data.security.total_penalty}
                </span>
              </div>
            </div>
          </section>

          {/* Multi-step */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <SectionHeader
                title="Multi-Step Security"
                description="Cross-step attacks and workflow integrity."
              />

              <Link
                href="/multistep"
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Open Multi-Step
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                label="Scenarios"
                value={
                  data.multistep_security
                    .total_scenarios
                }
                description="Generated workflows"
              />

              <MetricCard
                label="Steps"
                value={
                  data.multistep_security
                    .total_steps
                }
                description="Workflow steps"
              />

              <MetricCard
                label="Passed"
                value={
                  data.multistep_security
                    .passed_steps
                }
                description="Successful steps"
                className="text-emerald-600"
              />

              <MetricCard
                label="Failed"
                value={
                  data.multistep_security
                    .failed_steps
                }
                description="Failed steps"
                className="text-red-600"
              />

              <MetricCard
                label="Blocked"
                value={
                  data.multistep_security
                    .attacks_blocked
                }
                description="Attacks blocked"
                className="text-emerald-600"
              />
            </div>
          </section>

          {/* Normal scenario results */}
          <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center">
              <SectionHeader
                title="Recent Scenario Results"
                description="Latest functional evaluation results."
              />

              <Link
                href="/evaluations"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                View Evaluations
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data.normal_results.map(
                (scenario) => {
                  const result =
                    scenario.analysis
                      ?.result || "UNKNOWN";

                  return (
                    <div
                      key={scenario.scenario_id}
                      className="flex flex-col justify-between gap-4 px-6 py-5 lg:flex-row lg:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {scenario.scenario_id}
                          </span>

                          <h3 className="font-bold text-slate-900">
                            {scenario.scenario_name}
                          </h3>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="text-xs text-slate-400">
                            {scenario.category}
                          </span>

                          <span className="text-xs text-slate-300">
                            •
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severityClass(
                              scenario.severity,
                            )}`}
                          >
                            {scenario.severity}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${resultClass(
                          result,
                        )}`}
                      >
                        {result}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          {/* Quick actions */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/evaluations"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Functional
              </p>

              <h3 className="mt-2 font-black">
                Evaluations
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Inspect normal scenario behavior.
              </p>
            </Link>

            <Link
              href="/security"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Protection
              </p>

              <h3 className="mt-2 font-black">
                Security
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Review policies and security posture.
              </p>
            </Link>

            <Link
              href="/replay"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Determinism
              </p>

              <h3 className="mt-2 font-black">
                Replay
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Verify recorded workflows in sandbox.
              </p>
            </Link>

            <Link
              href="/reports"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reporting
              </p>

              <h3 className="mt-2 font-black">
                Reports
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                View the complete security assessment.
              </p>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
