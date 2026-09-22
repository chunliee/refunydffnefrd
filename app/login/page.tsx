"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";

const VALID_USERS = [
  {
    id: "sa",
    username: "sa",
    password: "123",
    name: "supauser",
    role: "admin",
  },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const currentUsername = username.trim();
    const currentPassword = password;

    const user = VALID_USERS.find(
      (u) => u.username === currentUsername && u.password === currentPassword,
    );

    if (user) {
      const sessionData = {
        id: String(user.id),
        username: user.username,
        name: user.name,
        role: user.role,
      };

      Cookies.remove("user_auth", { path: "/" });

      Cookies.set("user_auth", JSON.stringify(sessionData), {
        expires: 1,
        path: "/",
      });

      window.location.replace("/");
    } else {
      setError("wrong credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-poppins">
      <div className="w-[400px] scale-90 origin-top">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/loginlog.jpg"
            alt="Logo"
            width={340}
            height={240}
            className="object-contain"
            priority
          />
        </div>
        <div className="bg-white border-4 border-red-600 rounded-3xl p-8 shadow-lg">
          {/* Header */}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Username
              </label>

              <input
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  // setError("");
                }}
                className={`mt-2 block w-full rounded-xl px-4 py-3 font-bold text-sm text-slate-800 outline-none border-2 transition-all ${
                  error
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 bg-slate-50 focus:bg-white"
                }`}
                placeholder=""
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Password
              </label>

              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={`mt-2 block w-full rounded-xl px-4 py-3 font-bold text-sm text-slate-800 outline-none border-2 transition-all ${
                  error
                    ? "border-red-500 bg-red-50 animate-pulse"
                    : "border-slate-200 bg-slate-50 focus:bg-white"
                }`}
                placeholder=""
              />
            </div>

            {/* Error
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-center text-xs font-bold text-red-600">
                {error}
              </div>
            )} */}

            {/* Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gray-400 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-red-600 active:scale-[0.98] cursor-pointer"
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <p className="mt-7 text-center text-[10px] font-bold uppercase tracking-wider text-slate-300">
            © 2026 - Data Analyst Dev
          </p>
        </div>
      </div>
    </div>
  );
}
