"use client";

import React, { useRef, useState } from "react";

interface OverModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  baseUrl: string;
  onUploadSuccess?: () => void;
}

export default function OverModal({
  isOpen,
  onClose,
  jobId,
  baseUrl,
  onUploadSuccess,
}: OverModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State untuk notif inline (ganti alert)
  const [notice, setNotice] = useState<{
    type: "error" | "info";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper: download blob + ambil filename dari Content-Disposition
  const downloadBlobWithFilename = async (
    res: Response,
    fallbackName: string,
  ) => {
    const blob = await res.blob();
    let filename = fallbackName;
    const cd = res.headers.get("Content-Disposition");
    if (cd) {
      const match = cd.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // === DOWNLOAD HANDLER (generic) ===
  const handleDownload = async (
    endpoint: string,
    fallbackName: string,
    label: string,
  ) => {
    setNotice(null); // reset notif tiap kali klik
    try {
      const res = await fetch(`${baseUrl}/jobs/${jobId}/${endpoint}`);

      if (!res.ok) {
        let msg = `There is no ${label} in this job.`;
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          /* bukan JSON, pakai default */
        }
        setNotice({ type: "error", message: msg });
        return;
      }

      // Guard: kalau server malah balikin JSON
      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setNotice({
          type: "error",
          message: data?.message || `There is no ${label} in this job.`,
        });
        return;
      }

      await downloadBlobWithFilename(res, fallbackName);
    } catch (err: any) {
      setNotice({ type: "error", message: `Error: ${err.message}` });
    }
  };

  const handleOveride1 = () =>
    handleDownload(
      "downloadauto",
      `auto_checks_job_${jobId}.csv`,
      "Auto Checks data",
    );
  const handleOveride2 = () =>
    handleDownload(
      "downloadmanual",
      `manual_checks_job_${jobId}.csv`,
      "Manual Checks data",
    );
  const handleOveride3 = () =>
    handleDownload(
      "downloadrejected",
      `rejected_job_${jobId}.csv`,
      "Rejected data",
    );

  // === UPLOAD HANDLERS ===
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      setSelectedFiles((prev) => [
        ...prev,
        ...Array.from(e.dataTransfer.files),
      ]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0 || !jobId) return;
    setUploading(true);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFiles[0]);

      const res = await fetch(`${baseUrl}/jobs/${jobId}/override`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setNotice({
          type: "error",
          message: errorData.error || "Failed to upload override file.",
        });
        return;
      }

      setSelectedFiles([]);
      onUploadSuccess?.();
      onClose();
    } catch (err: any) {
      setNotice({ type: "error", message: `Error: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            Override Refund Data
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* === SECTION: DOWNLOAD === */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Download
            </p>
            <button
              onClick={handleOveride1}
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-indigo-700 hover:text-white rounded-xl shadow-sm transition cursor-pointer"
            >
              Download Auto Checks data
            </button>
            <button
              onClick={handleOveride2}
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-indigo-700 hover:text-white rounded-xl shadow-sm transition cursor-pointer"
            >
              Download Manual Checks data
            </button>
            <button
              onClick={handleOveride3}
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-indigo-700 hover:text-white rounded-xl shadow-sm transition cursor-pointer"
            >
              Download Rejected Data
            </button>

            {/* === INLINE NOTICE (pengganti alert) === */}
            {notice && (
              <div
                className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl border flex items-center gap-2 ${
                  notice.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                {/* <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z"
                  />
                </svg> */}
                <span className="flex-1">{notice.message}</span>
                <button
                  onClick={() => setNotice(null)}
                  className="text-current opacity-60 hover:opacity-100 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* === SECTION: UPLOAD === */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Upload Override CSV
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-600 bg-indigo-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv"
                multiple
                className="hidden"
              />
              <p className="text-xs font-medium text-slate-700">
                Drag & drop CSV file, or{" "}
                <span className="text-indigo-600 font-semibold">Browse</span>
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                <p className="text-[11px] font-semibold text-slate-700">
                  File terpilih ({selectedFiles.length}):
                </p>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs"
                  >
                    <p className="font-semibold text-slate-800 truncate pr-2">
                      {file.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUploadSubmit}
              disabled={selectedFiles.length === 0 || uploading}
              className="w-full px-4 py-2.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl shadow-sm transition cursor-pointer"
            >
              {uploading
                ? "Uploading..."
                : `Upload (${selectedFiles.length}) File`}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
