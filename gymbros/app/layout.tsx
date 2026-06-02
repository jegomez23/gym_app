import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Circle",
  description: "Commits privados para disciplina y progreso emocional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
