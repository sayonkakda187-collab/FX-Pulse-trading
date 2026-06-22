import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-soft": "var(--surface-soft)",
        line: "var(--line)",

        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",

        sidebar: "var(--sidebar)",
        "sidebar-deep": "var(--sidebar-deep)",

        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        "primary-soft": "var(--primary-soft)",

        success: "var(--success)",
        "success-soft": "var(--success-soft)",

        warning: "var(--warning)",
        "warning-soft": "var(--warning-soft)",

        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",

        "neutral-soft": "var(--neutral-soft)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      maxWidth: {
        workspace: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
