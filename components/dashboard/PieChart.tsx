// components/dashboard/StatPieChart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { actionDistribution } from "@/lib/dummy-data";

const total = actionDistribution.reduce((s, d) => s + d.value, 0);

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
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
