import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import CONFIG from "./config/index";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
  },
});
