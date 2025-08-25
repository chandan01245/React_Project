import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // 👈 This maps @ to your /src folder
    },
  },
  server: {
    port: 8080,
    proxy: {
      "/app": {
        target: "http://backend:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
