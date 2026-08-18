import { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
// import "remixicon/fonts/remixicon.css";
import LayoutClient from "./layout-client";

// Setup Font Montserrat untuk Header
const fontMontserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
});

// Setup Font Inter untuk Isi/Body
const fontInter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Internal Control Data Transmitter (ICTD)",
  // icons: {
  //   icon: "/assets/logolag.PNG",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Memasang variabel font di sini agar Tailwind bisa membaca variabel CSS-nya
    <html
      lang="en"
      className={`${fontMontserrat.variable} ${fontInter.variable}`}
    >
      <body className="antialiased">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
