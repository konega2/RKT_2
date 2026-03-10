import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RKT Panel",
  description: "Panel interno de gestión del campeonato RKT.",
};

export default function RktPanelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
