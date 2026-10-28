// components/dashboard/ExportPanel.tsx
"use client";

import { useState } from "react";

export default function ExportPanel() {
  const [form, setForm] = useState({
    ids: "", // multi-line, 1 ObjectID per baris
    tickets: "", // multi-line, 1 value per baris
    pnrs: "", // multi-line, 1 value per baris
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    ids: string[];
    tickets: string[];
    pnrs: string[];
  }>({
    ids: [],
    tickets: [],
    pnrs: [],
  });

  const baseUrl =
    typeof window !== "undefined"
      ? `http://${window.location.hostname}:8084`
      : "";

  // Parse: split by newline, trim, buang kosong, dedupe
  const parseLines = (raw: string): string[] => {
    const arr = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return Array.from(new Set(arr)); // dedupe
  };

  const update = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Update preview
    if (k === "ids") setPreview((p) => ({ ...p, ids: parseLines(v) }));
    if (k === "tickets") setPreview((p) => ({ ...p, tickets: parseLines(v) }));
    if (k === "pnrs")
      setPreview((p) => ({
        ...p,
        pnrs: parseLines(v).map((u) => u.toUpperCase()),
      }));
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const ids = parseLines(form.ids);
      const tickets = parseLines(form.tickets);
      const pnrs = parseLines(form.pnrs).map((s) => s.toUpperCase());

      if (
        ids.length === 0 &&
        tickets.length === 0 &&
        pnrs.length === 0 &&
        !form.from &&
        !form.to
      ) {
        throw new Error(
          "Isi minimal salah satu filter (_id / Ticket / PNR / Tanggal).",
        );
      }

      // Validasi format ObjectID (24 hex chars)
      const invalidIds = ids.filter((id) => !/^[a-fA-F0-9]{24}$/.test(id));
      if (invalidIds.length > 0) {
        throw new Error(
          `Format _id tidak valid (harus 24 hex): ${invalidIds
            .slice(0, 3)
            .join(", ")}${invalidIds.length > 3 ? ", ..." : ""}`,
        );
      }

      // Guard limit (backend max 1000 per filter)
      if (ids.length > 1000 || tickets.length > 1000 || pnrs.length > 1000) {
        throw new Error("Maksimal 1000 item per filter.");
      }

      const params = new URLSearchParams();
      // Backend baca query "id" (fallback ke "_id")
      if (ids.length) params.append("id", ids.join(","));
      if (tickets.length) params.append("ticket_no", tickets.join(","));
      if (pnrs.length) params.append("pnr_code", pnrs.join(","));
      if (form.from) params.append("start_date", form.from);
      if (form.to) params.append("to_date", form.to);

      const url = `${baseUrl}/refunds/export?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        let msg = `Gagal export (${res.status})`;
        try {
          const json = await res.json();
          if (json?.message) msg = json.message;
        } catch {}
        throw new Error(msg);
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename=([^;]+)/i);
      const fileName = match
        ? match[1].replace(/["']/g, "").trim()
        : `export_refund_${Date.now()}.csv`;

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
    setForm({ ids: "", tickets: "", pnrs: "", from: "", to: "" });
    setPreview({ ids: [], tickets: [], pnrs: [] });
    setError(null);
  };

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Export Data</h3>
      <p className="mb-4 text-xs text-gray-500">
        {/* Paste banyak data dari Excel (1 nilai per baris). */}
      </p>

      <form onSubmit={handleExport} className="space-y-4">
        {/* _ID (Mongo ObjectID) */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-600">
              _id (ObjectID) <span className="text-gray-400"></span>
            </label>
            {preview.ids.length > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                {preview.ids.length} item
              </span>
            )}
          </div>
          <textarea
            rows={3}
            // placeholder={
            //   "507f1f77bcf86cd799439011\n507f191e810c19729de860ea\n...paste dari Excel"
            // }
            value={form.ids}
            onChange={(e) => update("ids", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* TICKETS */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-600">
              No. Ticket <span className="text-gray-400"></span>
            </label>
            {preview.tickets.length > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                {preview.tickets.length} item
              </span>
            )}
          </div>
          <textarea
            rows={4}
            value={form.tickets}
            onChange={(e) => update("tickets", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* PNRS */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-600">
              PNR Code <span className="text-gray-400"></span>
            </label>
            {preview.pnrs.length > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                {preview.pnrs.length} item
              </span>
            )}
          </div>
          <textarea
            rows={4}
            // placeholder={"ABC123\nDEF456\n...paste dari Excel"}
            value={form.pnrs}
            onChange={(e) => update("pnrs", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs uppercase outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* DATE RANGE */}
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
            className="flex-1 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
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
