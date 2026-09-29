// components/dashboard/StatPieChart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { actionDistribution } from "@/lib/dummy-data";

const total = actionDistribution.reduce((s, d) => s + d.value, 0);

interface LegendItem {
  value?: number;
  color?: string;
  payload?: { name: string; value: number; fill: string };
}

const CustomLegend = ({ payload }: { payload?: LegendItem[] }) => {
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
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.payload?.name ?? "-"}
            </span>
            <span className="font-mono text-gray-500">
              {value.toLocaleString()}{" "}
              <span className="text-gray-400">({pct.toFixed(1)}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default function StatPieChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Distribution by Action
        </h3>
        <span className="text-xs text-gray-400">
          Total {total.toLocaleString()}
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={actionDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {actionDistribution.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, n: string) => [
                `${v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`,
                n,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend custom di luar chart — nggak interaktif */}
      <CustomLegend
        payload={actionDistribution.map((d) => ({
          value: d.value,
          color: d.fill,
          payload: { name: d.name, value: d.value, fill: d.fill },
        }))}
      />
    </div>
  );
}
