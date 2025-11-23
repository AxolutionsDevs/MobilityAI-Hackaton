import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard PHI - Metro Systems",
  description: "Sistema de Análisis con NLP para transporte público",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
