"use client";

import React from "react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  baseUrl: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  jobId,
  baseUrl,
}: ExportModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    // Membuka endpoint download backend di tab baru/langsung trigger download browser
    window.open(`${baseUrl}/jobs/${jobId}/download`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            Export Refund Data
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Download File CSV Refund
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Job ID: <span className="font-mono text-slate-700">{jobId}</span>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition cursor-pointer"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
