// components/dashboard/SlaBarChart.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";

const BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:8084/chart/bar`
    : "";

type MonthlyPoint = {
  month: string;
  month_label: string;
  ontime: number;
  overdue: number;
  total_paid: number;
  ontime_rate: number;
  overdue_rate: number;
};

type GroupedMonthly = {
  group: string;
  monthly_data: MonthlyPoint[];
  total_paid: number;
};

type BarResponse = {
  success: boolean;
  months: number;
  agents: string[] | null;
  data: {
    overall_monthly: MonthlyPoint[];
    by_refund_type: GroupedMonthly[];
    by_agent: GroupedMonthly[];
  };
};

const VALID_USERS: { agent: string; name: string }[] = [
  { agent: "JKTBA0", name: "TAUFIK" },
  { agent: "JKTBAW", name: "Alif" },
  { agent: "JKTBML", name: "MIA" },
  { agent: "JKTBFU", name: "FITRI" },
  { agent: "JKTBMN", name: "MAGDALENA LAWA" },
  { agent: "JKTBAJ", name: "AGNI" },
  { agent: "JKTBSU", name: "SURIYADIH" },
];

const RANGE_OPTIONS = [3, 6, 12, 24];

type SectionKey = "overall_monthly" | "by_refund_type" | "by_agent";
type ViewMode = "count" | "percent";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "overall_monthly", label: "Overall Monthly" },
  { key: "by_refund_type", label: "By Refund Type" },
  { key: "by_agent", label: "By Agent" },
];

/* ===== Multi-Select Dropdown (sama seperti sebelumnya) ===== */
function AgentMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allSelected = selected.length === 0;
  const label = allSelected
    ? "All Agents"
    : selected.length === 1
      ? (VALID_USERS.find((u) => u.agent === selected[0])?.name ?? selected[0])
      : `${selected.length} agents`;

  const toggle = (agent: string) => {
    if (selected.includes(agent)) onChange(selected.filter((a) => a !== agent));
    else onChange([...selected, agent]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:border-gray-300"
      >
        <span className="max-w-[120px] truncate">{label}</span>
        <svg
          className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M5.5 7.5L10 12l4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <button
            onClick={() => onChange([])}
            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs ${
              allSelected
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>All Agents</span>
            {allSelected && <span>✓</span>}
          </button>
          <div className="my-1 h-px bg-gray-100" />
          <div className="max-h-56 overflow-y-auto">
            {VALID_USERS.map((u) => {
              const checked = selected.includes(u.agent);
              return (
                <button
                  key={u.agent}
                  onClick={() => toggle(u.agent)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-gray-600 hover:bg-gray-50"
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                      checked
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {checked && "✓"}
                  </span>
                  <span className="flex-1 truncate">{u.name}</span>
                  <span className="text-gray-400">{u.agent}</span>
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <>
              <div className="my-1 h-px bg-gray-100" />
              <button
                onClick={() => onChange([])}
                className="w-full rounded-md px-2 py-1.5 text-left text-xs text-red-500 hover:bg-red-50"
              >
                Clear selection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== Main ===== */
export default function SlaBarChart() {
  const [months, setMonths] = useState<number>(6);
  const [agents, setAgents] = useState<string[]>([]);
  const [activeSection, setActiveSection] =
    useState<SectionKey>("overall_monthly");
  const [viewMode, setViewMode] = useState<ViewMode>("count");
  const [data, setData] = useState<BarResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ months: String(months) });
        if (agents.length > 0) params.set("agent", agents.join(","));
        const res = await fetch(`${BASE_URL}?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: BarResponse = await res.json();
        setData(json.data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => controller.abort();
  }, [months, agents]);

  /* ---------------------------------------------------
   * Bangun chartData + series.
   * Setiap series punya: key, fill, dan accessor untuk
   * count vs percent.
   * ------------------------------------------------- */
  const { chartData, series, isPercent } = useMemo(() => {
    const empty = {
      chartData: [] as Record<string, string | number>[],
      series: [] as { key: string; fill: string; kind: "ontime" | "overdue" }[],
      isPercent: viewMode === "percent",
    };
    if (!data) return empty;

    const PALETTE_ONTIME = [
      "#10b981",
      "#0ea5e9",
      "#8b5cf6",
      "#f59e0b",
      "#14b8a6",
      "#6366f1",
      "#84cc16",
      "#06b6d4",
    ];
    const OVERDUE_COLOR = "#ef4444";

    const pct = (val: number, total: number) =>
      total > 0 ? +((val / total) * 100).toFixed(1) : 0;

    // ---- Overall ----
    if (activeSection === "overall_monthly") {
      const chartData = (data.overall_monthly ?? []).map((d) => ({
        month: d.month,
        month_label: d.month_label,
        // count
        "Ontime (count)": d.ontime,
        "Overdue (count)": d.overdue,
        // percent (pakai total_paid dari backend, fallback ontime+overdue)
        "Ontime (%)": pct(d.ontime, d.total_paid || d.ontime + d.overdue),
        "Overdue (%)": pct(d.overdue, d.total_paid || d.ontime + d.overdue),
      }));
      const series = [
        { key: "Ontime", fill: "#10b981", kind: "ontime" as const },
        { key: "Overdue", fill: OVERDUE_COLOR, kind: "overdue" as const },
      ];
      return { chartData, series, isPercent: viewMode === "percent" };
    }

    // ---- Grouped ----
    const groups =
      activeSection === "by_refund_type"
        ? (data.by_refund_type ?? [])
        : (data.by_agent ?? []);

    const monthMap = new Map<string, { month: string; month_label: string }>();
    for (const g of groups) {
      for (const m of g.monthly_data) {
        monthMap.set(m.month, { month: m.month, month_label: m.month_label });
      }
    }
    const monthsSorted = Array.from(monthMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    const chartData = monthsSorted.map((m) => {
      const row: Record<string, string | number> = {
        month: m.month,
        month_label: m.month_label,
      };
      for (const g of groups) {
        const pt = g.monthly_data.find((x) => x.month === m.month);
        const total = pt?.total_paid || (pt?.ontime ?? 0) + (pt?.overdue ?? 0);
        row[`${g.group} — Ontime (count)`] = pt?.ontime ?? 0;
        row[`${g.group} — Overdue (count)`] = pt?.overdue ?? 0;
        row[`${g.group} — Ontime (%)`] = pct(pt?.ontime ?? 0, total);
        row[`${g.group} — Overdue (%)`] = pct(pt?.overdue ?? 0, total);
      }
      return row;
    });

    const series: { key: string; fill: string; kind: "ontime" | "overdue" }[] =
      [];
    groups.forEach((g, i) => {
      const base = PALETTE_ONTIME[i % PALETTE_ONTIME.length];
      series.push(
        { key: `${g.group} — Ontime`, fill: base, kind: "ontime" },
        { key: `${g.group} — Overdue`, fill: OVERDUE_COLOR, kind: "overdue" },
      );
    });

    return { chartData, series, isPercent: viewMode === "percent" };
  }, [data, activeSection, viewMode]);

  // Resolve actual dataKey berdasarkan viewMode
  const resolveKey = (baseKey: string) =>
    `${baseKey} (${isPercent ? "%" : "count"})`;

  const hasData =
    chartData.length > 0 &&
    series.some((s) =>
      chartData.some((row) => Number(row[resolveKey(s.key)]) > 0),
    );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header + Filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700">
          SLA Monthly — Last {months} Months
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <AgentMultiSelect selected={agents} onChange={setAgents} />

          {/* Count / Percent toggle */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(["count", "percent"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition ${
                  viewMode === mode
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {mode === "count" ? "Count" : "%"}
              </button>
            ))}
          </div>

          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {RANGE_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  months === m
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
              activeSection === s.key
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-gray-400">
          Loading...
        </div>
      ) : error ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-red-500">
          {error}
        </div>
      ) : !data ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-gray-400">
          There is no data.
        </div>
      ) : !hasData ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-gray-400">
          No data available.
        </div>
      ) : (
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis
                dataKey="month_label"
                tick={{ fontSize: 11, fill: "##BF40BF" }}
                axisLine={{ stroke: "## BF40BF" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#BF40BF" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={isPercent}
                domain={isPercent ? [0, 100] : undefined}
                tickFormatter={(v) => (isPercent ? `${v}%` : `${v}`)}
              />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.08)" }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
                formatter={(v: number, name: string) => {
                  const cleanName = name.replace(/\s*\((count|%)\)$/, "");
                  return [
                    isPercent
                      ? `${Number(v).toFixed(1)}%`
                      : Number(v).toLocaleString("id-ID"),
                    cleanName,
                  ];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                iconType="circle"
                iconSize={8}
                formatter={(v) => v.replace(/\s*\((count|%)\)$/, "")}
              />
              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={resolveKey(s.key)}
                  fill={s.fill}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  <LabelList
                    dataKey={resolveKey(s.key)}
                    position="top"
                    formatter={(v: number) =>
                      v > 0
                        ? isPercent
                          ? `${Number(v).toFixed(0)}%`
                          : Number(v).toLocaleString("id-ID")
                        : ""
                    }
                    style={{ fontSize: 9, fill: "#64748b" }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
