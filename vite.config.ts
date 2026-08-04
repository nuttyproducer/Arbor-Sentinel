/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
        },
      },
    },
    // Raise chunk size warning threshold to surface meaningful issues
    chunkSizeWarningLimit: 400,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: true,
  },
});
