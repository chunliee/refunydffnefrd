// components/dashboard/TrendRefundValues.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BASE_URL = "http://localhost:8084/chart/nominal";

type ChartDataPoint = {
  date: string;
  total_nominal: number;
  total_all_ticket: number;
  total_emd: number;
  total_ticket: number;
  total_processed_ticket: number;
  total_jobs: number;
};

type ApiResponse = {
  success: boolean;
  days: number;
  total: number;
  data: ChartDataPoint[];
  message?: string;
};

type MetricKey = keyof Omit<ChartDataPoint, "date">;

const METRICS: {
  key: MetricKey;
  label: string;
  color: string;
  format?: "currency" | "number";
}[] = [
  {
    key: "total_nominal",
    label: "Nominal",
    color: "#f97316",
    format: "currency",
  },
  { key: "total_all_ticket", label: "All Ticket", color: "#3b82f6" },
  { key: "total_emd", label: "EMD", color: "#8b5cf6" },
  { key: "total_ticket", label: "Ticket", color: "#10b981" },
  {
    key: "total_processed_ticket",
    label: "Processed Ticket",
    color: "#ef4444",
  },
  { key: "total_jobs", label: "Jobs", color: "#eab308" },
];

const RANGE_OPTIONS = [14, 31, 90, 180, 365];

export default function TrendRefundValues() {
  const [days, setDays] = useState<number>(14);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>([
    "total_nominal",
  ]);

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
        const json: ApiResponse = await res.json();
        setData(json.data ?? []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [days]);

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // Karena total_nominal jauh lebih besar dari metric lain, kita pisah YAxis
  const hasNominal = activeMetrics.includes("total_nominal");
  const hasNonNominal = activeMetrics.some((k) => k !== "total_nominal");

  // YAxis domain untuk non-nominal (biar scaling bagus)
  const nonNominalMax = useMemo(() => {
    if (!hasNonNominal) return 0;
    let max = 0;
    for (const d of data) {
      for (const m of activeMetrics) {
        if (m === "total_nominal") continue;
        if (d[m] > max) max = d[m];
      }
    }
    return max;
  }, [data, activeMetrics, hasNonNominal]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header + Range Filter */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Refund Trend — Last {days} Days
          </h3>
          <span className="text-xs text-gray-400"></span>
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

      {/* Metric Toggles (Checkbox chips) */}
      <div className="mb-4 flex flex-wrap gap-2">
        {METRICS.map((m) => {
          const active = activeMetrics.includes(m.key);
          return (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-transparent text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
              style={active ? { backgroundColor: m.color } : undefined}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: active ? "#fff" : m.color,
                }}
              />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-72">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-red-500">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No data available
          </div>
        ) : activeMetrics.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Pilih minimal satu metric untuk ditampilkan.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              {/* YAxis kiri untuk nominal */}
              {hasNominal && (
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000_000
                      ? `${(v / 1_000_000_000).toFixed(1)}B`
                      : v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(0)}M`
                        : v >= 1000
                          ? `${(v / 1000).toFixed(0)}k`
                          : `${v}`
                  }
                />
              )}
              {/* YAxis kanan untuk metric count */}
              {hasNonNominal && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  domain={[0, nonNominalMax > 0 ? "auto" : 100]}
                />
              )}
              <Tooltip
                formatter={(v: number, name: string) => [
                  name === "Nominal"
                    ? `Rp ${v.toLocaleString("id-ID")}`
                    : v.toLocaleString("id-ID"),
                  name,
                ]}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => (
                <Line
                  key={m.key}
                  yAxisId={m.key === "total_nominal" ? "left" : "right"}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
