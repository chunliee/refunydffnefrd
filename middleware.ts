import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("user_auth")?.value;
  const { pathname } = request.nextUrl;

  // 1. Bypass static files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // 2. Proteksi Dasar (Belum Login)
  if (!authCookie && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Proteksi Lanjutan (Sudah Login)
  if (authCookie) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      // Decode cookie terlebih dahulu agar JSON.parse tidak crash karena encoding dari js-cookie
      const decodedCookie = decodeURIComponent(authCookie);
      const userData = JSON.parse(decodedCookie);
      const userRole = userData.role;

      // --- LOGIC ROLE PROTECTION ---

      // Halaman yang butuh admin/subadmin/role1 (All except delete)
      const restrictedForLowerRoles = ["/engine"];
      if (
        restrictedForLowerRoles.includes(pathname) &&
        !["admin", "subadmin", "role1", "role2"].includes(userRole)
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Halaman DELETE: Hanya Admin
      if (pathname === "/delete" && userRole !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Halaman UPLOAD: Guest tidak boleh masuk
      if (pathname === "/upload" && userRole === "guest") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Jika cookie corrupt, hapus cookie dan paksa login ulang
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("user_auth");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
