// components/dashboard/HealthBarGate.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import HealthBar from "@/components/dashboard/HealthBar";

export default function HealthBarGate() {
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = Cookies.get("user_auth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setRole(parsed.role ?? "");
      } catch {
        setRole("");
      }
    }
    setReady(true);
  }, []);

  // Belum baca cookie → jangan render apa-apa (hindari flicker)
  if (!ready) return null;

  // Sembunyikan kalau role "test"
  if (role === "test") return null;

  return <HealthBar />;
}
