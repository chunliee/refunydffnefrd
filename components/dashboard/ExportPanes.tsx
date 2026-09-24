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

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: ganti ke API asli
      // const res = await fetch(`/api/export?${new URLSearchParams(form)}`);
      // const blob = await res.blob();
      // ...trigger download
      console.log("Export with filter:", form);
      await new Promise((r) => setTimeout(r, 800)); // dummy delay
      alert("Dummy export triggered. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setForm({ ticket: "", pnr: "", from: "", to: "" });

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Export Data</h3>
      {/* <p className="mb-4 text-xs text-gray-400">
            Filter by ticket, PNR, atau rentang tanggal.
        </p> */}

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

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Exporting..." : "Export"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>
    </aside>
  );
}
