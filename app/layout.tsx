import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { FXPulseProvider } from "@/context/FXPulseContext";
import { AppShell } from "@/components/shell/AppShell";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FX Pulse — EA Intelligence Workspace",
  description:
    "FX Pulse Phase 1: collect, evaluate, compare and review Expert Advisors with a risk-first AI assistant. Research workspace — not a live trading terminal.",
};

export const viewport: Viewport = {
  themeColor: "#1d1e33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <FXPulseProvider>
          <AppShell>{children}</AppShell>
        </FXPulseProvider>
      </body>
    </html>
  );
}
