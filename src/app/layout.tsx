import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard - MedicalExamPro",
  description: "Admin Management Portal for MedicalExamPro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#edf0f4] text-slate-800 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
