// components/dashboard/StatPieChart.tsx
"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const BASE_URL = "http://localhost:8084/chart/pie";

type PieItem = {
  label: string;
  value: number;
  percentage: number;
};

type PieResponse = {
  success: boolean;
  days: number;
  data: {
    processing_distribution: PieItem[];
    default_vs_edited: PieItem[];
    ticket_vs_emd: PieItem[];
    refund_by_uploader: PieItem[];
  };
};

const RANGE_OPTIONS = [14, 31, 90, 180, 365];

const PALETTES: Record<string, string[]> = {
  processing_distribution: ["#3b82f6", "#10b981", "#ef4444", "#f59e0b"],
  default_vs_edited: ["#64748b", "#f97316"],
  ticket_vs_emd: ["#0ea5e9", "#EBA937"],
  refund_by_uploader: [
    "#6366f1",
    "#ec4899",
    "#14b8a6",
    "#f59e0b",
    "#84cc16",
    "#8b5cf6",
    "#06b6d4",
    "#f43f5e",
    "#a3e635",
    "#d946ef",
  ],
};

type SectionKey =
  | "processing_distribution"
  | "default_vs_edited"
  | "ticket_vs_emd"
  | "refund_by_uploader";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "processing_distribution", label: "Processing" },
  { key: "default_vs_edited", label: "Default vs Edited" },
  { key: "ticket_vs_emd", label: "Ticket vs EMD" },
  { key: "refund_by_uploader", label: "By Uploader" },
];

interface LegendEntry {
  color?: string;
  payload?: { name: string; value: number; percentage: number };
}

function CustomLegend({
  payload,
  total,
}: {
  payload?: LegendEntry[];
  total: number;
}) {
  if (!payload) return null;

  return (
    <ul className="mt-2 flex flex-col gap-1.5 text-xs">
      {payload.map((entry, idx) => {
        const value = entry.payload?.value ?? 0;
        const pct = total > 0 ? (value / total) * 100 : 0;

        return (
          <li
            key={idx}
            className="flex items-center justify-between gap-3 text-gray-600"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">{entry.payload?.name ?? "-"}</span>
            </span>
            <span className="shrink-0 font-mono text-gray-500">
              {value.toLocaleString("id-ID")}{" "}
              <span className="text-gray-400">({pct.toFixed(1)}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function StatPieChart() {
  const [days, setDays] = useState<number>(14);
  const [activeSection, setActiveSection] = useState<SectionKey>(
    "processing_distribution",
  );
  const [data, setData] = useState<PieResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}?days=${days}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: PieResponse = await res.json();
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
  }, [days]);

  const items = data?.[activeSection] ?? [];
  const palette = PALETTES[activeSection];
  const total = items.reduce((s, d) => s + d.value, 0);

  const chartData = items.map((d, i) => ({
    name: d.label,
    value: d.value,
    percentage: d.percentage,
    fill: palette[i % palette.length],
  }));

  const legendPayload: LegendEntry[] = chartData.map((d) => ({
    color: d.fill,
    payload: { name: d.name, value: d.value, percentage: d.percentage },
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header + Range Filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Distribution — Last {days} Days
          </h3>
        </div>

        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {RANGE_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                days === d
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {d}d
            </button>
          ))}
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
          Memuat data...
        </div>
      ) : error ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-red-500">
          {error}
        </div>
      ) : !data ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-gray-400">
          Tidak ada data.
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs text-gray-400">
              Total {total.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="h-64">
            {chartData.length === 0 || total === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Tidak ada data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, n: string) => {
                      const item = chartData.find((c) => c.name === n);
                      const pct = item?.percentage ?? 0;
                      return [
                        `${v.toLocaleString("id-ID")} (${pct.toFixed(1)}%)`,
                        n,
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <CustomLegend payload={legendPayload} total={total} />
        </div>
      )}
    </div>
  );
}
