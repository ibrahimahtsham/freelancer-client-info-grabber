import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/freelancer-client-info-grabber/",
  build: {
    outDir: "build",
    assetsDir: "assets", // Ensure this is set correctly
  },
});
