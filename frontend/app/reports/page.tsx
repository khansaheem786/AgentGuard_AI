"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ScenarioResult = {
  scenario_id: string;
  scenario_name: string;
  category: string;
  severity: string;
  analysis: {
    result: string;
    failure_type?: string | null;
    explanation?: string;
    recommendation?: string;
  };
};

type Finding = {
  mutation_id: string;
  mutation_type: string;
  status: string;
  severity: string;
  failure_type: string | null;
  explanation: string;
  recommendation: string;
};

type MultiStepScenarioResult = {
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
    status: string;
    steps: unknown[];
  };
  analysis: {
    scenario_id: string;
    scenario_name: string;
    overall_status: string;
    total_steps: number;
    passed_steps: number;
    failed_steps: number;
    attacks_detected: number;
    attacks_blocked: number;
    steps: unknown[];
  };
};

type EvaluationResponse = {
  agent: string;

  overall: {
    score: number;
    grade: string;
    risk_level: string;
  };

  reliability: {
    score: number;
    passed: number;
    failed: number;
    review: number;
  };

  security: {
    total_mutations: number;
    blocked_mutations: number;
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
    scenarios: MultiStepScenarioResult[];
  };

  normal_results: ScenarioResult[];
  findings: Finding[];
};

export default function ReportsPage() {
  const [data, setData] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setRunning(true);
      setError("");

      const response = await fetch(
        "https://agentguard-ai-9rbc.onrender.com/api/reports/latest",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
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
      setRunning(false);
    }
  }

  useEffect(() => {
      loadReport();
  }, []);

  function resultClass(result: string) {
    return result.toUpperCase() === "PASS"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";
  }

  function riskClass(risk: string) {
    switch (risk.toUpperCase()) {
      case "LOW":
        return "bg-emerald-50 text-emerald-700";

      case "MODERATE":
        return "bg-amber-50 text-amber-700";

      case "HIGH":
        return "bg-orange-50 text-orange-700";

      default:
        return "bg-red-50 text-red-700";
    }
  }

  function multiStepStatusClass(status: string) {
    return status.toUpperCase() === "PASS"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";
  }

  if (loading && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-10 py-8 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Generating evaluation report...
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

            <NavItem href="/" label="Dashboard" />
            <NavItem href="/evaluations" label="Evaluations" />
            <NavItem href="/security" label="Security" />
            <NavItem href="/mutations" label="Mutations" />
            <NavItem href="/multistep" label="Multi-Step" />
            <NavItem href="/reports" label="Reports" active />
          </nav>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Assessment
              </p>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Reports
              </h1>
            </div>

            <button
              type="button"
              onClick={loadReport}
              disabled={running}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Generating..." : "Refresh Report"}
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
                {/* Report header */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                          EVALUATION REPORT
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${riskClass(
                            data.overall.risk_level,
                          )}`}
                        >
                          {data.overall.risk_level} RISK
                        </span>
                      </div>

                      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                        AgentGuard Security Assessment
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Comprehensive reliability and security assessment for{" "}
                        <span className="font-semibold text-slate-700">
                          {data.agent}
                        </span>
                        .
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Overall Score
                        </p>

                        <p className="mt-1 text-5xl font-bold text-emerald-600">
                          {data.overall.score}
                        </p>

                        <p className="text-sm font-bold text-slate-500">
                          Grade {data.overall.grade}
                        </p>
                      </div>

                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-3xl text-emerald-600">
                        ✓
                      </div>
                    </div>
                  </div>
                </section>

                {/* Executive metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <ReportMetric
                    label="Overall Score"
                    value={`${data.overall.score}`}
                    description={`Grade ${data.overall.grade}`}
                    valueClass="text-emerald-600"
                  />

                  <ReportMetric
                    label="Reliability"
                    value={`${data.reliability.score}%`}
                    description={`${data.reliability.passed} passed`}
                    valueClass="text-blue-600"
                  />

                  <ReportMetric
                    label="Security"
                    value={`${data.security.security_score}%`}
                    description={`${data.security.blocked_mutations}/${data.security.total_mutations} blocked`}
                    valueClass="text-emerald-600"
                  />

                  <ReportMetric
                    label="Risk"
                    value={data.overall.risk_level}
                    description="Current assessment"
                    valueClass="text-emerald-600"
                  />
                </div>

                {/* Reliability */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeading
                    title="Reliability Assessment"
                    description="Functional behavior assessment across normal scenarios."
                  />

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <StatusCard
                      label="Passed"
                      value={data.reliability.passed}
                      className="text-emerald-600"
                    />

                    <StatusCard
                      label="Failed"
                      value={data.reliability.failed}
                      className={
                        data.reliability.failed > 0
                          ? "text-red-600"
                          : "text-slate-900"
                      }
                    />

                    <StatusCard
                      label="Review"
                      value={data.reliability.review}
                      className={
                        data.reliability.review > 0
                          ? "text-amber-600"
                          : "text-slate-900"
                      }
                    />
                  </div>
                </section>

                {/* Security */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeading
                    title="Security Assessment"
                    description="Adversarial mutation resistance and security findings."
                  />

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatusCard
                      label="Total Mutations"
                      value={data.security.total_mutations}
                      className="text-slate-900"
                    />

                    <StatusCard
                      label="Blocked"
                      value={data.security.blocked_mutations}
                      className="text-emerald-600"
                    />

                    <StatusCard
                      label="Failed"
                      value={data.security.failed_mutations}
                      className={
                        data.security.failed_mutations > 0
                          ? "text-red-600"
                          : "text-slate-900"
                      }
                    />

                    <StatusCard
                      label="Penalty"
                      value={data.security.total_penalty}
                      className="text-slate-900"
                    />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SeverityCard
                      label="Critical"
                      value={data.security.critical_findings}
                      className="bg-red-50 text-red-700"
                    />

                    <SeverityCard
                      label="High"
                      value={data.security.high_findings}
                      className="bg-orange-50 text-orange-700"
                    />

                    <SeverityCard
                      label="Medium"
                      value={data.security.medium_findings}
                      className="bg-amber-50 text-amber-700"
                    />

                    <SeverityCard
                      label="Low"
                      value={data.security.low_findings}
                      className="bg-slate-100 text-slate-700"
                    />
                  </div>
                </section>

                {/* Functional scenario results */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <SectionHeading
                      title="Functional Scenario Results"
                      description="Normal behavior evaluation performed by AgentGuard."
                    />
                  </div>

                  <div className="divide-y divide-slate-100">
                    {data.normal_results.map((scenario) => (
                      <div
                        key={scenario.scenario_id}
                        className="px-6 py-5"
                      >
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-400">
                                {scenario.scenario_id}
                              </span>

                              <h3 className="font-semibold text-slate-950">
                                {scenario.scenario_name}
                              </h3>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {scenario.category} · {scenario.severity}
                            </p>

                            {scenario.analysis.explanation && (
                              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                                {scenario.analysis.explanation}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${resultClass(
                              scenario.analysis.result,
                            )}`}
                          >
                            {scenario.analysis.result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Multi-Step Security Evaluation */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <SectionHeading
                      title="Multi-Step Security Evaluation"
                      description="Context-aware security evaluation across chained agent actions."
                    />
                  </div>

                  {/* Summary cards */}
                  <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatusCard
                      label="Scenarios"
                      value={data.multistep_security.total_scenarios}
                      className="text-slate-900"
                    />

                    <StatusCard
                      label="Total Steps"
                      value={data.multistep_security.total_steps}
                      className="text-slate-900"
                    />

                    <StatusCard
                      label="Attacks Detected"
                      value={data.multistep_security.attacks_detected}
                      className="text-orange-600"
                    />

                    <StatusCard
                      label="Attacks Blocked"
                      value={data.multistep_security.attacks_blocked}
                      className="text-emerald-600"
                    />
                  </div>

                  {/* Step and attack metrics */}
                  <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatusCard
                      label="Passed Steps"
                      value={data.multistep_security.passed_steps}
                      className="text-emerald-600"
                    />

                    <StatusCard
                      label="Failed Steps"
                      value={data.multistep_security.failed_steps}
                      className={
                        data.multistep_security.failed_steps > 0
                          ? "text-red-600"
                          : "text-slate-900"
                      }
                    />

                    <StatusCard
                      label="Unblocked Attacks"
                      value={data.multistep_security.unblocked_attacks}
                      className={
                        data.multistep_security.unblocked_attacks > 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    />

                    <StatusCard
                      label="Security Score"
                      value={data.multistep_security.security_score}
                      className={
                        data.multistep_security.security_score >= 90
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    />
                  </div>

                  {/* Score banner */}
                  <div className="px-6 pb-6">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                            Multi-Step Security Status
                          </p>

                          <p className="mt-1 text-sm text-emerald-800">
                            {data.multistep_security.attacks_blocked} of{" "}
                            {data.multistep_security.attacks_detected} detected
                            attacks were blocked by AgentGuard.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-emerald-700">
                            {data.multistep_security.security_score}
                          </span>

                          <span className="text-sm font-bold text-emerald-700">
                            / 100
                          </span>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${riskClass(
                              data.multistep_security.risk_level,
                            )}`}
                          >
                            Grade {data.multistep_security.grade} ·{" "}
                            {data.multistep_security.risk_level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario details */}
                  <div className="border-t border-slate-100">
                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Multi-Step Scenario Results
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {data.multistep_security.scenarios.map((item) => (
                        <div
                          key={item.scenario.id}
                          className="px-6 py-6"
                        >
                          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-400">
                                  {item.scenario.id}
                                </span>

                                <h3 className="font-semibold text-slate-950">
                                  {item.scenario.name}
                                </h3>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500">
                                  {item.scenario.category}
                                </span>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                    item.scenario.severity === "CRITICAL"
                                      ? "bg-red-50 text-red-700"
                                      : item.scenario.severity === "HIGH"
                                        ? "bg-orange-50 text-orange-700"
                                        : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {item.scenario.severity}
                                </span>
                              </div>

                              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                                {item.scenario.description}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                                <span className="text-slate-500">
                                  Steps:{" "}
                                  <strong className="text-slate-900">
                                    {item.analysis.total_steps}
                                  </strong>
                                </span>

                                <span className="text-emerald-600">
                                  Passed:{" "}
                                  <strong>
                                    {item.analysis.passed_steps}
                                  </strong>
                                </span>

                                <span
                                  className={
                                    item.analysis.failed_steps > 0
                                      ? "text-red-600"
                                      : "text-slate-500"
                                  }
                                >
                                  Failed:{" "}
                                  <strong>
                                    {item.analysis.failed_steps}
                                  </strong>
                                </span>

                                <span className="text-orange-600">
                                  Attacks:{" "}
                                  <strong>
                                    {item.analysis.attacks_detected}
                                  </strong>
                                </span>

                                <span className="text-emerald-600">
                                  Blocked:{" "}
                                  <strong>
                                    {item.analysis.attacks_blocked}
                                  </strong>
                                </span>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${multiStepStatusClass(
                                item.analysis.overall_status,
                              )}`}
                            >
                              {item.analysis.overall_status}
                            </span>
                          </div>

                          {/* Security interpretation */}
                          {item.analysis.attacks_detected > 0 && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <p className="text-xs leading-5 text-slate-600">
                                <strong className="text-slate-900">
                                  Security interpretation:
                                </strong>{" "}
                                {item.analysis.attacks_blocked ===
                                item.analysis.attacks_detected
                                  ? "The adversarial action was detected and successfully blocked by AgentGuard."
                                  : "One or more detected adversarial actions were not blocked and require remediation."}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Mutation results */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <SectionHeading
                      title="Mutation Results"
                      description="Adversarial mutations evaluated against security controls."
                    />
                  </div>

                  <div className="divide-y divide-slate-100">
                    {data.findings.map((finding) => (
                      <div
                        key={finding.mutation_id}
                        className="flex flex-col justify-between gap-4 px-6 py-5 lg:flex-row lg:items-center"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              {finding.mutation_id}
                            </span>

                            <h3 className="font-semibold text-slate-950">
                              {finding.mutation_type}
                            </h3>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {finding.explanation}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${resultClass(
                              finding.status,
                            )}`}
                          >
                            {finding.status}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                            {finding.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Executive conclusion */}
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl text-emerald-600 shadow-sm">
                      ✓
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                        Executive Conclusion
                      </p>

                      <h2 className="mt-1 font-bold text-emerald-950">
                        Agent demonstrates strong reliability and security
                        posture.
                      </h2>

                      <p className="mt-2 max-w-4xl text-sm leading-6 text-emerald-800">
                        The current evaluation recorded{" "}
                        {data.reliability.passed} successful functional
                        scenarios and {data.security.blocked_mutations}{" "}
                        blocked adversarial mutations. Multi-step security
                        evaluation detected{" "}
                        {data.multistep_security.attacks_detected} attacks and
                        blocked{" "}
                        {data.multistep_security.attacks_blocked} of them.
                        No unblocked multi-step attacks were recorded.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Recommendations */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeading
                    title="Recommendations"
                    description="Suggested next steps based on the current evaluation."
                  />

                  <div className="mt-5 rounded-xl bg-slate-50 p-5">
                    {data.security.failed_mutations === 0 &&
                    data.reliability.failed === 0 &&
                    data.multistep_security.unblocked_attacks === 0 ? (
                      <p className="text-sm leading-6 text-slate-600">
                        No immediate remediation is required. Continue
                        continuous adversarial evaluation as agent behavior,
                        prompts, tools, permissions, and multi-step workflows
                        evolve.
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        Review the failed scenarios, mutation results, and
                        multi-step security findings before deploying the
                        evaluated agent to production.
                      </p>
                    )}
                  </div>
                </section>

                {/* Report footer */}
                <div className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
                  <p>
                    AgentGuard AI · Continuous Agent Reliability & Security
                    Evaluation
                  </p>

                  <p>Generated from the latest live evaluation</p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable components                                                 */
/* ------------------------------------------------------------------ */

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

function ReportMetric({
  label,
  value,
  description,
  valueClass,
}: {
  label: string;
  value: string;
  description: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-bold ${className}`}>{value}</p>
    </div>
  );
}

function SeverityCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-bold text-slate-950">{title}</h2>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
