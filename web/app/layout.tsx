import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { useAuthStore } from "@/lib/store/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "工作量系统",
  description: "高校教师工作量管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ProtectedRoute>
          <Navbar />
          <main>
            {children}
          </main>
        </ProtectedRoute>
      </body>
    </html>
  );
}
