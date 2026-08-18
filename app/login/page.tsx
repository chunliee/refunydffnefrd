"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";

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

    // LANGSUNG AMBIL DARI STATE (Bukan dari FormData agar tidak kosong)
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

      // Hapus & Tulis ulang cookie secara bersih
      Cookies.remove("user_auth", { path: "/" });

      Cookies.set("user_auth", JSON.stringify(sessionData), {
        expires: 1,
        path: "/",
      });

      // Pindah halaman total
      window.location.replace("/");
    } else {
      setError("wrong credentials");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Login Page</h1>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username" style={{ display: "block" }}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password" style={{ display: "block" }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        {error && (
          <p style={{ color: "red", fontSize: "14px", margin: "10px 0" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{ width: "100%", padding: "10px", cursor: "pointer" }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
