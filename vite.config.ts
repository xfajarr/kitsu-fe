import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const API_TARGET = process.env.VITE_DEV_API_PROXY ?? "http://localhost:3001";

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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
