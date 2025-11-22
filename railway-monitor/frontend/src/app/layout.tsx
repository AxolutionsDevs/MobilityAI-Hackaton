import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Railway Monitor",
  description: "Base para hackathon Railway Monitor",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-50">{children}</body>
    </html>
  );
}


