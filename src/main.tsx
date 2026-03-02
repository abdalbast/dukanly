import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

function renderError(err: unknown) {
  const msg = err instanceof Error ? err.message : "Unknown error";
  root.render(
    <div style={{ padding: 40, fontFamily: "system-ui", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ color: "#e11d48" }}>Application failed to start</h1>
      <p>{msg}</p>
      <p style={{ color: "#6b7280", fontSize: 14 }}>
        Check that the environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are configured.
      </p>
    </div>,
  );
}

// Catch module-level throws that escape dynamic import in Vite dev mode
window.addEventListener("error", (event) => {
  if (
    event.error?.message?.includes("Supabase environment variables") ||
    event.error?.message?.includes("Failed to fetch dynamically imported module")
  ) {
    event.preventDefault();
    renderError(event.error);
  }
});

async function boot() {
  try {
    const { initObservability } = await import("@/lib/observability");
    initObservability();
  } catch {
    // observability is optional
  }

  try {
    await import("@/integrations/supabase/client");
    const { default: App } = await import("./App.tsx");
    root.render(<App />);
  } catch (err) {
    console.error("Failed to boot application:", err);
    renderError(err);
  }
}

boot();
