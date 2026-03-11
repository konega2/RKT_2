import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { GlobalBackground } from "@/components/global-background";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rental Karting Trophy (RKT)",
  description: "Web oficial del evento Rental Karting Trophy (RKT).",
  metadataBase: new URL("https://rentalkartingtrophy.com"),
  openGraph: {
    title: "Rental Karting Trophy (RKT)",
    description: "Web oficial del evento Rental Karting Trophy (RKT).",
    url: "https://rentalkartingtrophy.com",
    siteName: "Rental Karting Trophy (RKT)",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rental Karting Trophy (RKT)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rental Karting Trophy (RKT)",
    description: "Web oficial del evento Rental Karting Trophy (RKT).",
    images: ["/opengraph-image"],
  },
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