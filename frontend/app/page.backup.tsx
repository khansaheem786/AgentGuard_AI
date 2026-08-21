"use client";

import { useState } from "react";

type Finding = {
  mutation_id: string;
  mutation_type: string;
  status: string;
  severity: string;
  failure_type: string | null;
  explanation: string;
  recommendation: string;
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
    grade: string;
    total_tests: number;
    passed: number;
    failed: number;
    review: number;
    critical_failures: number;
    high_failures: number;
    pass_rate: number;
  };
  security: {
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
  summary: {
    normal_tests: number;
    normal_passed: number;
    normal_failed: number;
    mutation_tests: number;
    mutation_failed: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
  };
  findings: Finding[];
};

const initialData: Evaluation = {
  agent: "OpsPilot AI",
  overall: {
    score: 100,
    grade: "A",
    risk_level: "LOW",
  },
  reliability: {
    score: 100,
    grade: "A",
    total_tests: 5,
    passed: 5,
    failed: 0,
    review: 0,
    critical_failures: 0,
    high_failures: 0,
    pass_rate: 100,
  },
  security: {
    total_mutations: 5,
    failed_mutations: 0,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 0,
    low_findings: 0,
    total_penalty: 0,
    security_score: 100,
    grade: "A",
    risk_level: "LOW",
  },
  summary: {
    normal_tests: 5,
    normal_passed: 5,
    normal_failed: 0,
    mutation_tests: 5,
    mutation_failed: 0,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 0,
  },
  findings: [],
};

function Icon({ type }: { type: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
  };

  if (type === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6l7-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (type === "activity") {
    return (
      <svg {...common}>
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </svg>
    );
  }

  if (type === "layers") {
    return (
      <svg {...common}>
        <path d="m12 3 9 5-9 5-9-5 9-5z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </svg>
    );
  }

  if (type === "file") {
    return (
      <svg {...common}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.5v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.5h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.5v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.5h-.1a1.7 1.7 0 0 0-1.6 1z" />
      </svg>
    );
  }

  return null;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon type={icon} />
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-48 w-48">
      <svg className="h-full w-full -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#2563eb"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-slate-900">{score}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Score
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<Evaluation>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runEvaluation() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/evaluation/master", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Evaluation failed with status ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the AgentGuard backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Icon type="shield" />
            </div>

            <div>
              <p className="font-bold tracking-tight">AgentGuard</p>
              <p className="text-[11px] font-medium text-slate-400">
                AI SECURITY PLATFORM
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Workspace
            </p>

            {[
              ["Dashboard", "dashboard", true],
              ["Evaluations", "activity", false],
              ["Security", "shield", false],
              ["Mutations", "layers", false],
              ["Reports", "file", false],
            ].map(([label, icon, active]) => (
              <button
                key={label as string}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon type={icon as string} />
                {label as string}
              </button>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <Icon type="settings" />
              Settings
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Security Evaluation
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Agent Dashboard
              </h1>
            </div>

            <button
              onClick={runEvaluation}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Running..." : "Run Evaluation"}
            </button>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Agent banner */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{data.agent}</h2>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Evaluation Ready
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  AgentGuard continuous reliability and security assessment
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Current Risk
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-600">
                  {data.overall.risk_level}
                </p>
              </div>
            </div>

            {/* Main score */}
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex flex-col items-center justify-between gap-7 md:flex-row">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Overall AgentGuard Score
                    </p>

                    <h2 className="mt-2 text-4xl font-bold tracking-tight">
                      Security Posture
                    </h2>

                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                      Combined reliability and security evaluation of the
                      selected AI agent.
                    </p>

                    <div className="mt-6 flex items-center gap-3">
                      <span className="rounded-lg bg-blue-50 px-4 py-2 text-2xl font-bold text-blue-700">
                        Grade {data.overall.grade}
                      </span>

                      <span className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                        {data.overall.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  <ScoreRing score={data.overall.score} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <StatCard
                  title="Reliability"
                  value={`${data.reliability.score}%`}
                  subtitle={`${data.reliability.passed}/${data.reliability.total_tests} tests passed`}
                  icon="activity"
                  accent="bg-blue-50 text-blue-600"
                />

                <StatCard
                  title="Security"
                  value={`${data.security.security_score}%`}
                  subtitle={`${data.security.total_mutations - data.security.failed_mutations}/${data.security.total_mutations} mutations blocked`}
                  icon="shield"
                  accent="bg-emerald-50 text-emerald-600"
                />
              </div>
            </div>

            {/* Metrics */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold">Evaluation Summary</h2>
                <p className="text-sm text-slate-500">
                  Latest AgentGuard evaluation metrics
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Normal Tests"
                  value={`${data.summary.normal_passed}/${data.summary.normal_tests}`}
                  subtitle="Functional scenarios passed"
                  icon="activity"
                  accent="bg-sky-50 text-sky-600"
                />

                <StatCard
                  title="Mutation Tests"
                  value={`${data.summary.mutation_tests - data.summary.mutation_failed}/${data.summary.mutation_tests}`}
                  subtitle="Adversarial mutations blocked"
                  icon="layers"
                  accent="bg-violet-50 text-violet-600"
                />

                <StatCard
                  title="Critical Findings"
                  value={`${data.summary.critical_findings}`}
                  subtitle="Security-critical issues"
                  icon="shield"
                  accent="bg-rose-50 text-rose-600"
                />

                <StatCard
                  title="High Findings"
                  value={`${data.summary.high_findings}`}
                  subtitle="High severity issues"
                  icon="file"
                  accent="bg-amber-50 text-amber-600"
                />
              </div>
            </div>

            {/* Reliability + Security */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">Reliability</h2>
                    <p className="text-sm text-slate-500">
                      Functional behavior assessment
                    </p>
                  </div>

                  <span className="font-bold text-blue-600">
                    {data.reliability.pass_rate}%
                  </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${data.reliability.pass_rate}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold">
                      {data.reliability.passed}
                    </p>
                    <p className="text-xs text-slate-500">Passed</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold">
                      {data.reliability.failed}
                    </p>
                    <p className="text-xs text-slate-500">Failed</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold">
                      {data.reliability.review}
                    </p>
                    <p className="text-xs text-slate-500">Review</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">Security</h2>
                    <p className="text-sm text-slate-500">
                      Mutation resistance assessment
                    </p>
                  </div>

                  <span className="font-bold text-emerald-600">
                    {data.security.security_score}%
                  </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${data.security.security_score}%`,
                    }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-rose-50 p-3">
                    <p className="text-lg font-bold text-rose-700">
                      {data.security.critical_findings}
                    </p>
                    <p className="text-[11px] text-slate-500">Critical</p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-3">
                    <p className="text-lg font-bold text-amber-700">
                      {data.security.high_findings}
                    </p>
                    <p className="text-[11px] text-slate-500">High</p>
                  </div>

                  <div className="rounded-xl bg-yellow-50 p-3">
                    <p className="text-lg font-bold text-yellow-700">
                      {data.security.medium_findings}
                    </p>
                    <p className="text-[11px] text-slate-500">Medium</p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-lg font-bold text-emerald-700">
                      {data.security.total_mutations -
                        data.security.failed_mutations}
                    </p>
                    <p className="text-[11px] text-slate-500">Blocked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Findings */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold">Security Findings</h2>
                  <p className="text-sm text-slate-500">
                    Mutation-level security analysis
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {data.findings.length} Findings
                </span>
              </div>

              {data.findings.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icon type="shield" />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    No security findings
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    All current mutation tests were handled safely.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Mutation</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Severity</th>
                        <th className="px-6 py-4">Recommendation</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {data.findings.map((finding) => (
                        <tr key={finding.mutation_id}>
                          <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                            {finding.mutation_id}
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-700">
                            {finding.mutation_type}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                finding.status === "PASS"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {finding.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                finding.severity === "CRITICAL"
                                  ? "bg-red-50 text-red-700"
                                  : finding.severity === "HIGH"
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {finding.severity}
                            </span>
                          </td>

                          <td className="max-w-md px-6 py-4 text-xs leading-5 text-slate-500">
                            {finding.recommendation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <footer className="pb-4 text-center text-xs text-slate-400">
              AgentGuard AI • Continuous Agent Reliability & Security
              Evaluation
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
