"use client";

import React, { useEffect, useState } from "react";

interface HealthItem {
  _id: string;
  name: string;
  status: string;
  success: boolean;
  last_checked_at: string | null;
  last_success_at?: string | null;
  last_failure_at?: string | null;
}

interface HealthResponse {
  data: HealthItem[];
  success: boolean;
  total: number;
}

// Urutan & label yang ditampilkan
const TARGETS: { key: "ticket" | "farebase"; name: string; label: string }[] = [
  { key: "ticket", name: "single", label: "SINGLE TICKET" },
  { key: "ticket", name: "bulk", label: "BULK TICKET" },
  { key: "farebase", name: "icda_frbs", label: "ICDA" },
];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
  } catch {
    return "-";
  }
}

export default function HealthBar() {
  const [ticketData, setTicketData] = useState<HealthItem[]>([]);
  const [farebaseData, setFarebaseData] = useState<HealthItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const baseUrl =
    typeof window !== "undefined"
      ? `http://${window.location.hostname}:8084`
      : "";

  const fetchHealth = async () => {
    try {
      const [ticketRes, farebaseRes] = await Promise.all([
        fetch(`${baseUrl}/api/health/ticket`),
        fetch(`${baseUrl}/api/health/farebase`),
      ]);
      const ticketJson: HealthResponse = await ticketRes.json();
      const farebaseJson: HealthResponse = await farebaseRes.json();
      setTicketData(Array.isArray(ticketJson.data) ? ticketJson.data : []);
      setFarebaseData(
        Array.isArray(farebaseJson.data) ? farebaseJson.data : [],
      );
      setLoading(false);
    } catch (err) {
      console.error("HealthBar fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Gabungkan data sesuai TARGETS urutan
  const rows = TARGETS.map((t) => {
    const source = t.key === "ticket" ? ticketData : farebaseData;
    const found = source.find((d) => d.name === t.name);
    return {
      label: t.label,
      item: found,
    };
  });

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          Loading health status...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {rows.map(({ label, item }) => {
          const isOk = item?.status?.toUpperCase() === "OK";
          return (
            <div key={label} className="px-4 py-3">
              {/* Title + Status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item
                        ? isOk
                          ? "bg-emerald-500"
                          : "bg-red-500"
                        : "bg-slate-300"
                    }`}
                  ></span>
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    !item
                      ? "bg-slate-100 text-slate-400"
                      : isOk
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {item?.status || "N/A"}
                </span>
              </div>

              {/* Timestamps */}
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Last Checked</span>
                  <span className="font-mono text-slate-700 text-right">
                    {formatDate(item?.last_checked_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Last Success</span>
                  <span className="font-mono text-emerald-700 text-right">
                    {formatDate(item?.last_success_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Last Failure</span>
                  <span
                    className={`font-mono text-right ${
                      item?.last_failure_at ? "text-red-700" : "text-slate-400"
                    }`}
                  >
                    {formatDate(item?.last_failure_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
