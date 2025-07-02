import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Vite builds your app into this folder
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000", // <--- Your local backend port. Ensure your local backend runs on this!
    },
  },
});
