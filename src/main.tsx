import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

async function boot() {
  try {
    const { initObservability } = await import("@/lib/observability");
    initObservability();
  } catch {
    // observability is optional
  }

  try {
    // Dynamic import so the throw in client.ts doesn't kill the entire app
    await import("@/integrations/supabase/client");
    const { default: App } = await import("./App.tsx");
    root.render(<App />);
  } catch (err) {
    console.error("Failed to boot application:", err);
    root.render(
      <div style={{ padding: 40, fontFamily: "system-ui", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ color: "#e11d48" }}>Application failed to start</h1>
        <p>{err instanceof Error ? err.message : "Unknown error"}</p>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Check that the environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are configured.
        </p>
      </div>,
    );
  }
}

boot();
