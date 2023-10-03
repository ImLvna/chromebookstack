import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  root: "src/client/manager",
  base: "/manager/",
  build: {
    outDir: "../../../public/manager",
    emptyOutDir: true,
  },
});
