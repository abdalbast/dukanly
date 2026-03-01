import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

const frameAncestors = [
  "'self'",
  "https://lovable.dev",
  "https://*.lovable.dev",
  "https://*.lovableproject.com",
].join(" ");

const securityHeaders = {
  "Content-Security-Policy":
    `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.sentry.io https://api.lovable.dev https://*.lovable.dev https://*.lovableproject.com https://*.lovableproject-dev.com ws: wss:; frame-ancestors ${frameAncestors}; base-uri 'self'; form-action 'self'`,
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  // X-Frame-Options cannot express an allowlist, so CSP frame-ancestors is authoritative here.
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: securityHeaders,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    headers: securityHeaders,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
