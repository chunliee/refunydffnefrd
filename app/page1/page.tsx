"use client";

import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import ExportModal from "@/components/Modal";

interface JobItem {
  id: string;
  refund_type: string;
  file_name: string;
  uploaded_by: string;
  created_at: string;
  total_records: number;
  processed_cnt: number;
  rejected_records: number;
  manual_records: number;
  pending_records: number;
  api_status: string;
  vcr_status: string;
  pnr_status: string;
  manual_status: string;
  status: string;
}

export default function JobListPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportJobId, setExportJobId] = useState<string | null>(null);

  // === State Filter Lengkap ===
  const [search, setSearch] = useState<string>("");
  const [jobIdFilter, setJobIdFilter] = useState<string>("");
  const [refundType, setRefundType] = useState<string>("");
  const [uploadedBy, setUploadedBy] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  // State untuk Pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);

  // State Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [activeDetailModal, setActiveDetailModal] = useState<{
    type: "VCR" | "PNR" | "Manual";
    job: JobItem;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);

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
        console.error("Gagal parse role:", err);
      }
    }
  }, []);

  // Fetch data jobs dengan semua query parameters filter
  const fetchJobs = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (search) params.append("search", search);
    if (jobIdFilter) params.append("_id", jobIdFilter);
    if (refundType) params.append("refund_type", refundType);
    if (uploadedBy) params.append("uploaded_by", uploadedBy);
    if (fileName) params.append("file_name", fileName);

    const url = `${baseUrl}/jobs?${params.toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        return res.json();
      })
      .then((json) => {
        const data = json.data || [];
        setJobs(Array.isArray(data) ? data : []);
        if (json.meta && json.meta.total_pages) {
          setTotalPages(json.meta.total_pages);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setJobs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [page, limit, search, jobIdFilter, refundType, uploadedBy, fileName]);

  const handleResetFilters = () => {
    setSearch("");
    setJobIdFilter("");
    setRefundType("");
    setUploadedBy("");
    setFileName("");
    setPage(1);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Download & Upload helpers
  const downloadVcrhPrint = async (jobId: string | number) => {
    try {
      const response = await fetch(`${baseUrl}/jobs/${jobId}/vcrhprint`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Gagal mengunduh file VCRH Print");
      let fileName = `VCRH_Print_Job_${jobId}.mac`;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const downloadPnrPrint = async (jobId: string | number) => {
    try {
      const response = await fetch(`${baseUrl}/jobs/${jobId}/pnrprint`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Gagal mengunduh file PNR Print");
      let fileName = `PNR_Print_Job_${jobId}.mac`;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const uploadVcrFile = async (jobId: string | number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${baseUrl}/jobs/${jobId}/vcrhupload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Gagal mengunggah file VCR");
      alert("File VCR berhasil diunggah!");
      fetchJobs();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles((prev) => [
        ...prev,
        ...Array.from(e.dataTransfer.files),
      ]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));

    fetch(`${baseUrl}/upload/refund/csv`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengunggah file");
        return res.json();
      })
      .then(() => {
        setUploading(false);
        setSelectedFiles([]);
        setIsModalOpen(false);
        fetchJobs();
      })
      .catch((err) => {
        alert(err.message);
        setUploading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">
            Memuat data job...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="bg-red-50 border border-red-200 px-6 py-4 rounded-2xl shadow-sm text-center">
          <p className="text-red-600 font-semibold text-sm mb-2">
            Error: {error}
          </p>
          <button
            onClick={fetchJobs}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow-xs hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans relative"
      style={{ zoom: 0.8 }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload File
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Job Processing Management
            </h1>
          </div>
        </div>

        <button
          onClick={fetchJobs}
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
          Sync Data
        </button>
      </div>

      {/* FILTER BARIS ATAS (MEMUAT SEMUA PARAMETER BACKEND) */}
      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* 1. Global Search */}
          {/* <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Global Search
            </label>
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div> */}

          {/* 2. Job ID */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Job ID
            </label>
            <input
              type="text"
              placeholder=""
              value={jobIdFilter}
              onChange={(e) => {
                setJobIdFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* 3. Refund Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Refund Type
            </label>
            <select
              value={refundType}
              onChange={(e) => {
                setRefundType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Type</option>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
            </select>
          </div>

          {/* 4. Uploaded By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Uploaded By
            </label>
            <input
              type="text"
              placeholder=""
              value={uploadedBy}
              onChange={(e) => {
                setUploadedBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 5. File Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              File Name
            </label>
            <input
              type="text"
              placeholder=""
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tombol Reset Filter */}
        {(search || jobIdFilter || refundType || uploadedBy || fileName) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer underline"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-indigo-600 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Job ID</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">File Name</th>
                <th className="py-3.5 px-4 font-semibold">User Name</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Stats</th>
                <th className="py-3.5 px-4 font-semibold">API Status</th>
                <th className="py-3.5 px-4 font-semibold">VCR Status</th>
                <th className="py-3.5 px-4 font-semibold">PNR Status</th>
                <th className="py-3.5 px-4 font-semibold">Manual Status</th>
                <th className="py-3.5 px-4 font-semibold">Export</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {!Array.isArray(jobs) || jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-12 text-center text-slate-400 font-medium"
                  >
                    Tidak ada data job ditemukan.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">
                      {job.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {job.refund_type || "B2B"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {job.file_name ? (
                        <div className="flex flex-col space-y-0.5">
                          {job.file_name.split(",").map((name, idx) => (
                            <span key={idx} className="block">
                              {name.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {job.uploaded_by || "Admin/System"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      <div className="flex flex-col space-y-0.5">
                        <span>
                          Total:{" "}
                          <strong className="text-slate-900">
                            {job.total_records ?? 0}
                          </strong>
                        </span>
                        <span>
                          Processed:{" "}
                          <strong className="text-emerald-600">
                            {job.processed_cnt ?? 0}
                          </strong>
                        </span>
                        <span>
                          Rejected:{" "}
                          <strong className="text-red-600">
                            {job.rejected_records ?? 0}
                          </strong>
                        </span>
                        <span>
                          Manual:{" "}
                          <strong className="text-amber-600">
                            {job.manual_records ?? 0}
                          </strong>
                        </span>
                        <span>
                          Pending:{" "}
                          <strong className="text-blue-600">
                            {job.pending_records ?? 0}
                          </strong>
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          job.api_status?.toLowerCase() === "done"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {job.api_status || "Fetching"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          setActiveDetailModal({ type: "VCR", job })
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                      >
                        {job.vcr_status || "empty"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          setActiveDetailModal({ type: "PNR", job })
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                      >
                        {job.pnr_status || "empty"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          setActiveDetailModal({ type: "Manual", job })
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                      >
                        {job.manual_status || "empty"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setExportJobId(job.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                      >
                        Export
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          job.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {job.status || "UNKNOWN"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Page <strong className="text-slate-700">{page}</strong> of{" "}
              <strong className="text-slate-700">{totalPages || 1}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>Entries per page</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPage((prev) => (page < totalPages ? prev + 1 : prev))
              }
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {activeDetailModal.type} (Job: {activeDetailModal.job.id})
              </h3>
              <button
                onClick={() => setActiveDetailModal(null)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="text-xs text-slate-500">
                Download MACRO or Upload{" "}
                <strong className="text-slate-700">
                  {activeDetailModal.type}
                </strong>
                :
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (activeDetailModal.type === "VCR") {
                      downloadVcrhPrint(activeDetailModal.job.id);
                    } else if (activeDetailModal.type === "PNR") {
                      downloadPnrPrint(activeDetailModal.job.id);
                    } else {
                      alert(`Download ${activeDetailModal.type}`);
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Download
                </button>
                <button
                  onClick={() => detailFileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Upload
                </button>
                <input
                  type="file"
                  ref={detailFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const selectedFile = e.target.files[0];
                      if (activeDetailModal.type === "VCR") {
                        uploadVcrFile(activeDetailModal.job.id, selectedFile);
                      }
                      setActiveDetailModal(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Upload Multiple Refund Files (CSV)
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFiles([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
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
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-xs font-medium text-slate-700">
                    Drag & drop file CSV di sini, atau{" "}
                    <span className="text-indigo-600 font-semibold">
                      browse
                    </span>
                  </p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
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
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={selectedFiles.length === 0 || uploading}
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition cursor-pointer"
              >
                {uploading
                  ? "Mengunggah..."
                  : `Upload (${selectedFiles.length}) File`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ExportModal
        isOpen={!!exportJobId}
        onClose={() => setExportJobId(null)}
        jobId={exportJobId || ""}
        baseUrl={baseUrl}
      />
    </div>
  );
}
