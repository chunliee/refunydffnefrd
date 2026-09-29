// components/dashboard/ExportPanel.tsx
"use client";

import { useState } from "react";

export default function ExportPanel() {
  const [form, setForm] = useState({
    ticket: "",
    pnr: "",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? `http://${window.location.hostname}:8084`
      : "";

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Map form field ke query param backend
      const params = new URLSearchParams();
      if (form.ticket) params.append("ticket_no", form.ticket.trim());
      if (form.pnr) params.append("pnr_code", form.pnr.trim().toUpperCase());
      if (form.from) params.append("start_date", form.from);
      if (form.to) params.append("to_date", form.to);

      const url = `${baseUrl}/refunds/export?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        // Backend kadang balikin JSON error walau status != 200
        let msg = `Gagal export (${res.status})`;
        try {
          const json = await res.json();
          if (json?.message) msg = json.message;
        } catch {
          // ignore: bukan JSON
        }
        throw new Error(msg);
      }

      // Ambil filename dari Content-Disposition kalau ada
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename=([^;]+)/i);
      const fileName = match
        ? match[1].replace(/["']/g, "").trim()
        : `export_refund_${Date.now()}.csv`;

      // Trigger download
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan saat export.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ ticket: "", pnr: "", from: "", to: "" });
    setError(null);
  };

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Export Data</h3>

      <form onSubmit={handleExport} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            No. Ticket
          </label>
          <input
            type="text"
            placeholder=""
            value={form.ticket}
            onChange={(e) => update("ticket", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            PNR Code
          </label>
          <input
            type="text"
            placeholder=""
            value={form.pnr}
            onChange={(e) => update("pnr", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Start Date
            </label>
            <input
              type="date"
              value={form.from}
              onChange={(e) => update("from", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              To Date
            </label>
            <input
              type="date"
              value={form.to}
              onChange={(e) => update("to", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Exporting..." : "Export"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={loading}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>
    </aside>
  );
}
