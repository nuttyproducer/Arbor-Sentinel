/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  base: "/Arbor-Sentinel/",
  plugins: [
    react(),
    // Bundle analysis — writes dist/stats.html after each production build.
    // Interactive treemap (gzipped + brotli sizes) for spotting heavy deps.
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
      open: false,
    }),
  ],
  build: {
    // Report chunk sizes after build — highlights heavy dependencies
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, benefits from long-term cache
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Animation library — isolated so pages without motion don't pay for it
          "vendor-motion": ["framer-motion"],
          // i18n — isolated, rarely changes
          "vendor-i18n": ["i18next", "react-i18next"],
          // Shared client/data utilities used across most pages
          "vendor-ui": ["@supabase/supabase-js", "zod"],
          // Map rendering — deferred; only loaded by the /map route
          "vendor-map": ["maplibre-gl"],
          // Charts — deferred; only loaded by admin dashboards
          "vendor-charts": ["recharts"],
          // Graph — deferred; only loaded by /explore/graph
          "vendor-graph": ["cytoscape"],
        },
      },
    },
    // Keep the threshold tight so oversized chunks surface in CI
    chunkSizeWarningLimit: 300,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: true,
    exclude: [
      ".claude/worktrees/**",
      "**/node_modules/**",
    ],
  },
});
