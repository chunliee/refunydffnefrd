// components/dashboard/TrendTicketCount.tsx
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
import { ticketCountTrend } from "@/lib/dummy-data";

export default function TrendTicketCount() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Refund Amount — Last 14 Days
        </h3>
        <span className="text-xs text-gray-400">
          excl. rejected · miliar Rupiah
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ticketCountTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d) => d.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`}
            />
            <Tooltip
              formatter={(v: number) => [
                `Rp ${v.toLocaleString("id-ID")}`,
                "Refund Amount",
              ]}
              labelFormatter={(l) => `Date: ${l}`}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
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
