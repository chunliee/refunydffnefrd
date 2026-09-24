"use client";

import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove("user_auth", { path: "/" });

    document.cookie =
      "user_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    window.location.replace("/login");
  };

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Process", href: "/page1" },
    { label: "Database", href: "/page2" },
  ];

  return (
    <nav className="bg-linear-to-r from-blue-950 via-orange-100 to-blue-950 text-white shadow-md">
      <div className="mx-auto flex h-15 items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center">
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
        </Link>

        {/* Navigation */}
        <ul className="flex items-center gap-10 text-base font-medium">
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
      </div>
    </nav>
  );
};

export default Navbar;
