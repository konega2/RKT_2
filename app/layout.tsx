import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { GlobalBackground } from "@/components/global-background";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rental Karting Trophy (RKT)",
  description: "Web oficial del campeonato Rental Karting Trophy (RKT).",
  icons: {
    icon: "/logos/LETRAS_RKT.png",
    shortcut: "/logos/LETRAS_RKT.png",
    apple: "/logos/LETRAS_RKT.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <GlobalBackground />
        {children}
      </body>
    </html>
  );
}