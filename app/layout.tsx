import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FXPulseProvider } from "@/context/FXPulseContext";
import { AppShell } from "@/components/shell/AppShell";

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
    <html lang="en">
      <head>
        {/*
          Fonts are loaded at runtime via Google Fonts (with system-font
          fallbacks defined in globals.css). This keeps the production build
          independent of build-time font fetching so deploys never fail on it.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <FXPulseProvider>
          <AppShell>{children}</AppShell>
        </FXPulseProvider>
      </body>
    </html>
  );
}
