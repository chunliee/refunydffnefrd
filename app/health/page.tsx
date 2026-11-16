"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

// ============================================================
// TYPES
// ============================================================
interface HealthItem {
  _id: string;
  name: string;
  status: string;
  success: boolean;
  message: string;
  duration_ms: number;
  request_count: number;
  covered_count: number;
  consecutive_fails: number;
  last_checked_at: string | null;
  last_success_at?: string | null;
  last_failure_at?: string | null;
  updated_at: string | null;
}

interface HealthResponse {
  data: HealthItem[];
  success: boolean;
  total: number;
}

// ============================================================
// NAME MAPPING (sesuai permintaan)
// ============================================================
const TICKET_TITLE_MAP: Record<string, string> = {
  single: "SINGLE TICKET",
  bulk: "BULK TICKET",
};

const FAREBASE_TITLE_MAP: Record<string, string> = {
  icda_frbs: "ICDA",
};

// ============================================================
// DATE FORMATTER
// ============================================================
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

export default function HealthMonitorPage() {
  const [ticketData, setTicketData] = useState<HealthItem[]>([]);
  const [farebaseData, setFarebaseData] = useState<HealthItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const baseUrl =
    typeof window !== "undefined"
      ? `http://${window.location.hostname}:8084`
      : "";

  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const auth = Cookies.get("user_auth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setUserRole(parsed.role);
      } catch (err) {
        console.error("Gagal parse auth:", err);
      }
    }
  }, []);

  // ============================================================
  // FETCH BOTH ENDPOINTS
  // ============================================================
  const fetchHealth = async () => {
    try {
      const [ticketRes, farebaseRes] = await Promise.all([
        fetch(`${baseUrl}/api/health/ticket`),
        fetch(`${baseUrl}/api/health/farebase`),
      ]);

      if (!ticketRes.ok) throw new Error("Gagal mengambil health ticket");
      if (!farebaseRes.ok) throw new Error("Gagal mengambil health farebase");

      const ticketJson: HealthResponse = await ticketRes.json();
      const farebaseJson: HealthResponse = await farebaseRes.json();

      setTicketData(Array.isArray(ticketJson.data) ? ticketJson.data : []);
      setFarebaseData(
        Array.isArray(farebaseJson.data) ? farebaseJson.data : [],
      );
      setLastRefresh(new Date());
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // auto-refresh tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">
            Loading Health Status....
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="bg-red-50 border border-red-200 px-6 py-4 rounded-2xl shadow-sm text-center">
          <p className="text-red-600 font-semibold text-sm mb-2">
            Error: {error}
          </p>
          <button
            onClick={fetchHealth}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow-xs hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER CARD
  // ============================================================
  const renderCard = (
    item: HealthItem,
    titleMap: Record<string, string>,
    category: "TICKET" | "FAREBASE",
  ) => {
    const displayTitle = titleMap[item.name] || item.name.toUpperCase();
    const isOk = item.status?.toUpperCase() === "OK";

    return (
      <div
        key={item._id}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                isOk
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-red-500 animate-pulse"
              }`}
            ></span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {displayTitle}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {category} • {item.name}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
              isOk
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {item.status || "UNKNOWN"}
          </span>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-3">
          {/* Message */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Message
            </p>
            <p className="text-xs font-mono text-slate-800 break-words">
              {item.message || "-"}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">
                Duration
              </p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {item.duration_ms?.toLocaleString() ?? 0} ms
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">
                Requests
              </p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {item.request_count ?? 0}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">
                Covered
              </p>
              <p className="text-sm font-bold text-indigo-600 font-mono">
                {item.covered_count ?? 0}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">
                Consec. Fails
              </p>
              <p
                className={`text-sm font-bold font-mono ${
                  (item.consecutive_fails ?? 0) > 0
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {item.consecutive_fails ?? 0}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium">Last Checked</span>
              <span className="font-mono text-slate-800 text-right">
                {formatDate(item.last_checked_at)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium">Last Success</span>
              <span className="font-mono text-emerald-700 text-right">
                {formatDate(item.last_success_at)}
              </span>
            </div>
            {item.last_failure_at && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 font-medium">Last Failure</span>
                <span className="font-mono text-red-700 text-right">
                  {formatDate(item.last_failure_at)}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium">Updated At</span>
              <span className="font-mono text-slate-600 text-right">
                {formatDate(item.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans relative"
      style={{ zoom: 0.8 }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Health Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Status real-time dari service Ticket &amp; Farebase. Auto-refresh
            setiap 15 detik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Last Refresh
            </p>
            <p className="text-xs font-mono font-semibold text-slate-700">
              {lastRefresh.toLocaleTimeString("en-GB", { hour12: false })}
            </p>
          </div>
          <button
            onClick={fetchHealth}
            className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <svg
              className="w-3.5 h-3.5 mr-2 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* TICKET SECTION */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Ticket Services
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            ({ticketData.length} service)
          </span>
        </div>

        {ticketData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No ticket health data
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketData.map((item) =>
              renderCard(item, TICKET_TITLE_MAP, "TICKET"),
            )}
          </div>
        )}
      </div>

      {/* FAREBASE SECTION */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Farebase Services
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            ({farebaseData.length} service)
          </span>
        </div>

        {farebaseData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No farebase health data
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farebaseData.map((item) =>
              renderCard(item, FAREBASE_TITLE_MAP, "FAREBASE"),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
