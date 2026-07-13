import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyTradEdge — Votre coach de discipline",
  description: "Journal de trading, statistiques, gestion du risque et suivi comportemental.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background text-textPrimary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
