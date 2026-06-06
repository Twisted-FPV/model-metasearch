import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Metasearch",
  description: "Search 3D model sites in one place."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
