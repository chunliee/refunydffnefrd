// components/dashboard/TrendRefundValues.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { refundValuesTrend } from "@/lib/dummy-data";

export default function TrendRefundValues() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Refund Count — Last 14 Days
        </h3>
        <span className="text-xs text-gray-400">excl. rejected</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={refundValuesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d) => d.slice(5)} // MM-DD
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v: number) => [v.toLocaleString(), "Refund Values"]}
              labelFormatter={(l) => `Date: ${l}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
