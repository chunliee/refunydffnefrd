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
    <nav className="bg-linear-to-bl from-blue-950 via-blue-900 to-blue-800 text-white shadow-md">
      <div className="mx-auto flex h-15 items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/liongroup.png"
            alt="Logo"
            width={150}
            height={150}
            className="h-16 w-50 object-contain brightness-0 invert"
            priority
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
