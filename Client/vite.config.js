import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Important for Vercel deployment if your app is at the root
  build: {
    outDir: "dist", // Default output directory
    emptyOutDir: true, // Clean dist folder before build
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000", // Or whatever your backend port is
    },
  },
});
