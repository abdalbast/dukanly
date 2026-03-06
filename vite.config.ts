import { defineConfig, loadEnv } from "vite";
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
  "Permissions-Policy": "camera=(), microphone=()",
};

// Fallback values for Supabase config (public/anon keys only – safe to embed)
const SUPABASE_DEFAULTS: Record<string, string> = {
  VITE_SUPABASE_URL: "https://augjkqqwvyalinkvxyhi.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Z2prcXF3dnlhbGlua3Z4eWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzc4NDcsImV4cCI6MjA4NzgxMzg0N30.3VTZcOmDN5thkBH9ivKJ1cG4vMA-uMCborCXwVB5r1Y",
  VITE_SUPABASE_PROJECT_ID: "augjkqqwvyalinkvxyhi",
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Build define map: inject fallback values for any missing VITE_SUPABASE_* vars
  const defineMap: Record<string, string> = {};
  for (const [key, fallback] of Object.entries(SUPABASE_DEFAULTS)) {
    if (!env[key]) {
      defineMap[`import.meta.env.${key}`] = JSON.stringify(fallback);
    }
  }

  return {
    define: defineMap,
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
  };
});
