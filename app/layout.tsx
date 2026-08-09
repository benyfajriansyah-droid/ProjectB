import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Hub",
  description: "Personal content idea & status hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
