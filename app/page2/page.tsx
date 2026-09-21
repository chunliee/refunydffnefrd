"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface UploadCardProps {
  title: string;
  subtitle: string;
  // description: string;
  endpoint: string;
  colorClass: {
    badge: string;
    border: string;
    button: string;
  };
  baseUrl: string;
}

const UPLOAD_CONFIGS = [
  {
    title: "Fare Base Database",
    subtitle: "Fare Base CSV",
    // description: "Upload data struktur tarif penerbangan ke database",
    endpoint: "/upload/farebase/csv",
    colorClass: {
      badge: "bg-slate-100 text-black border-slate-300",
      border: "hover:border-black",
      button: "bg-black hover:bg-black",
    },
  },
  {
    title: "Fare Taxes Database",
    subtitle: "Fare Taxes CSV",
    // description: "Upload komponen pajak & airport tax ke database",
    endpoint: "/upload/faretaxes/csv",
    colorClass: {
      badge: "bg-slate-100 text-black border-slate-300",
      border: "hover:border-black",
      button: "bg-black hover:bg-black",
    },
  },
  {
    title: "Flight List Database",
    subtitle: "Flight List CSV",
    // description: "Upload daftar rute & jadwal penerbangan ke database",
    endpoint: "/upload/flightlist/csv",
    colorClass: {
      badge: "bg-slate-100 text-black border-slate-300",
      border: "hover:border-black",
      button: "bg-black hover:bg-black",
    },
  },
  {
    title: "Tourcode Database",
    subtitle: "Tourcode CSV",
    // description: "Upload kode promo & referensi agen grup ke database",
    endpoint: "/upload/tourcode/csv",
    colorClass: {
      badge: "bg-slate-100 text-black border-slate-300",
      border: "hover:border-black",
      button: "bg-black hover:bg-black",
    },
  },
  {
    title: "Waiver Fee",
    subtitle: "Waiver Fee CSV",
    // description: "Upload aturan pembebasan denda ke database",
    endpoint: "/upload/waiverfee/csv",
    colorClass: {
      badge: "bg-slate-100 text-black border-slate-300",
      border: "hover:border-black",
      button: "bg-black hover:bg-black",
    },
  },
];

function CardUploadItem({
  title,
  // description,
  subtitle,
  endpoint,
  colorClass,
  baseUrl,
}: UploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        alert("Hanya file .csv yang diperbolehkan!");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}${endpoint}`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        alert(`Successfully uploaded ${selectedFile.name}`);
        setSelectedFile(null);
        setProgress(0);
      } else {
        alert(`Gagal upload: ${xhr.responseText || "Server Error"}`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert("Terjadi kesalahan jaringan.");
    };

    xhr.send(formData);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${colorClass.badge}`}
          >
            {title}
          </span>
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        {/* <p className="text-xs text-slate-500 mb-4">{description}</p> */}

        {/* Dropzone Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-600 bg-indigo-50/50"
              : `border-slate-200 bg-slate-50/50 ${colorClass.border}`
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            {selectedFile ? (
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                {selectedFile.name}
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-700">
                Drag & drop CSV, or{" "}
                <span className="text-indigo-600 font-semibold">browse</span>
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-3 space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right font-mono">
              {progress}%
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        {selectedFile && !uploading && (
          <button
            onClick={() => setSelectedFile(null)}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`w-full text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${colorClass.button}`}
        >
          {uploading ? "Uploading..." : `Upload ${subtitle}`}
        </button>
      </div>
    </div>
  );
}

export default function UploadDbPage() {
  const baseUrl =
    typeof window !== "undefined"
      ? `http://${window.location.hostname}:8084`
      : "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          {/* <Link
            href="/jobs"
            className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer active:scale-95"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Process
          </Link> */}

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Database Reference Upload
            </h1>
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UPLOAD_CONFIGS.map((config) => (
          <CardUploadItem
            key={config.endpoint}
            title={config.title}
            subtitle={config.subtitle}
            // description={config.description}
            endpoint={config.endpoint}
            colorClass={config.colorClass}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </div>
  );
}
