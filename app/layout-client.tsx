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

  // Login page: full screen tanpa Navbar dan tanpa padding wrapper
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        {children}
      </div>
    );
  }

  // Other pages
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />

      <main className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
