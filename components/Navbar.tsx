"use client";

import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const auth = Cookies.get("user_auth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setRole(parsed.role ?? "");
      } catch (err) {
        console.error("Gagal parse auth:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("user_auth", { path: "/" });
    document.cookie =
      "user_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace("/login");
  };

  const allMenuItems = [
    { label: "Home", href: "/", roles: ["admin", "staff", "test"] },
    { label: "Process", href: "/page1", roles: ["admin", "staff", "test"] },
    { label: "Database", href: "/page2", roles: ["admin", "staff"] }, // ← hidden untuk "test"
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="bg-linear-to-r from-blue-950 via-orange-100 to-blue-950 text-white shadow-md">
      <div className="mx-auto flex h-15 items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div
            className="h-12 w-40 sm:h-16 sm:w-50 bg-orange-200"
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
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-10 text-base font-medium">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-orange-200"
                      : "text-white hover:text-blue-300"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md px-3 py-2 font-medium transition-colors duration-200 hover:bg-white/10 hover:text-orange-200"
            >
              Logout
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              isOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              isOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 pb-4 pt-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-md px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-orange-200"
                      : "text-white hover:bg-white/10 hover:text-blue-300"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-white/10 hover:text-orange-200"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
