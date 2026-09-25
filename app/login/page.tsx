"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";

const VALID_USERS = [
  {
    id: "260284",
    username: "260284",
    password: "goyim",
    name: "admin",
    role: "admin",
  },
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
    <div
      className="min-h-screen relative flex items-center justify-center px-4 font-poppins bg-cover bg-center"
      style={{ backgroundImage: "url('/wpo.png')" }}
    >
      {/* Logo - pojok kiri atas */}
      <div className="absolute top-1 left-6 mb-2">
        <div
          className="h-16 w-50 bg-orange-200"
          style={{
            maskImage: "url('/liongroup.png')",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
            WebkitMaskImage: "url('/liongroup.png')",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
          }}
        />
      </div>

      {/* Kotak login tetap di tengah */}
      <div className="w-[560px] scale-80 origin-top translate-y-16">
        <div className="text-center mb-4">
          <h1 className="text-orange-200 text-3xl font-black uppercase tracking-wide">
            Refund Value Validator
          </h1>
          {/* <p className="text-white/80 text-xs font-medium mt-1">
            Silakan login untuk melanjutkan
          </p> */}
        </div>
        <div className="bg-white border-4 border-orange-200 rounded-xl p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              {/* <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Username
              </label> */}
              <input
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                className={`mt-2 block w-full rounded-xl px-4 py-3 font-bold text-sm text-slate-800 outline-none border-2 transition-all ${
                  error
                    ? "border-red-500 bg-red-50 animate-[borderPulse_1s_ease-in-out_infinite]"
                    : "border-slate-200 bg-slate-50 focus:bg-white"
                }`}
                placeholder="Username"
              />
            </div>

            {/* Password */}
            <div>
              {/* <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Password
              </label> */}
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
                placeholder="Password"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-orange-200 py-3.5 text-sm font-black uppercase tracking-wide text-white  transition-all hover:bg-red-600 hover:border-red-600 hover:text-white  hover:active:scale-[0.98] cursor-pointer"
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <p className="mt-7 text-center text-[10px] font-bold uppercase tracking-wider text-slate-300">
            © 2026 - Internal Control Data Analyst & Team Refund
          </p>
        </div>
      </div>
    </div>
  );
}
