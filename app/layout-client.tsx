"use client";

import Navbar from "@/components/Navbar";
import React from "react";
import { usePathname } from "next/navigation";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {!isLoginPage && <Navbar />}
      <main className="w-full">
        {/* Hapus class "container" mentah, ganti dengan wrapper fleksibel */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
