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
    <>
      {/* Hanya tampilkan Navbar jika BUKAN di halaman login */}
      {!isLoginPage && <Navbar />}

      {/* Konten Utama */}
      <main className={`${!isLoginPage ? "" : ""}`}>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
