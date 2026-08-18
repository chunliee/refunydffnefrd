"use client";

import React from "react";
import Cookies from "js-cookie"; // Jangan lupa import library-nya di sini

const Navbar = () => {
  const handleLogout = () => {
    // Menghapus cookie lewat js-cookie
    Cookies.remove("user_auth", { path: "/" });

    // Native fallback sebagai pengaman tambahan
    document.cookie =
      "user_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect bersih memotong cache router client-side
    window.location.replace("/login");
  };

  return (
    <div className="">
      <div className="">
        <div className="flex items-center justify-between mr-10">
          {/* LOGO */}
          <div className="logo flex items-center">
            <h1 className="h1 text-white font-bold">Logo</h1>
          </div>

          {/* MENU */}
          <ul className="menu flex items-center gap-12">
            <li>
              <a href="/">Home</a>
            </li>

            <li>
              <a href="/page1">page1</a>
            </li>

            <li>
              <a href="#">Contact</a>
            </li>

            <li>
              <button
                onClick={handleLogout}
                type="button"
                className="w-full"
                style={{
                  cursor: "pointer",
                  padding: "5px 10px",
                  display: "inline-block",
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
