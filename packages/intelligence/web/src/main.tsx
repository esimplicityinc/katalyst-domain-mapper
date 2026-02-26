import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/colors.css";
import App from "./App.tsx";
import { OpenFeatureProvider } from "./flags.ts";
import { loadFlags } from "./flags.ts";

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Fetch flags from the API and initialize the OpenFeature provider.
    // The OpenFeatureProvider handles suspense internally once the provider is set,
    // but we gate initial rendering to avoid a flash of default values.
    loadFlags().then(() => setReady(true));
  }, []);

  if (!ready) {
    return null; // Or a loading spinner — flags load fast from same-origin API
  }

  return (
    <OpenFeatureProvider>
      <App />
    </OpenFeatureProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
