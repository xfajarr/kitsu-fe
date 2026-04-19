import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const API_TARGET = process.env.VITE_DEV_API_PROXY ?? "http://localhost:3001";

/**
 * TonConnect wallets validate the manifest against the page origin. The checked-in
 * `public/tonconnect-manifest.json` points at production URLs; for dev / `vite preview`
 * we serve a manifest whose `url` and `iconUrl` match the actual host (any port).
 */
function tonconnectLocalManifestMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const urlPath = req.url?.split("?")[0];
    if (urlPath !== "/tonconnect-manifest.json" || req.method !== "GET") {
      next();
      return;
    }
    const host = req.headers.host ?? "localhost:8080";
    const xf = req.headers["x-forwarded-proto"];
    const rawProto = typeof xf === "string" ? xf.split(",")[0]?.trim() : undefined;
    const scheme = rawProto === "https" ? "https" : "http";
    const origin = `${scheme}://${host}`;
    const body = JSON.stringify({
      url: origin,
      name: "Kitsu",
      iconUrl: `${origin}/kitsu-icon.png`,
    });
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(body);
  };
}

function tonconnectManifestDevPlugin(): Plugin {
  return {
    name: "tonconnect-manifest-local",
    configureServer(server) {
      server.middlewares.use(tonconnectLocalManifestMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(tonconnectLocalManifestMiddleware());
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    /** When VITE_API_URL is empty, axios uses same origin (this dev server). Forward API paths to the backend. */
    proxy: {
      "/ai": { target: API_TARGET, changeOrigin: true },
      "/auth": { target: API_TARGET, changeOrigin: true },
      "/users": { target: API_TARGET, changeOrigin: true },
      "/goals": { target: API_TARGET, changeOrigin: true },
      "/dens": { target: API_TARGET, changeOrigin: true },
      "/portfolio": { target: API_TARGET, changeOrigin: true },
      "/transactions": { target: API_TARGET, changeOrigin: true },
      "/quests": { target: API_TARGET, changeOrigin: true },
      "/health": { target: API_TARGET, changeOrigin: true },
    },
  },
  plugins: [
    react(),
    tonconnectManifestDevPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
