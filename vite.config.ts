import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const defaultRust = await Bun.file("./build/default.rs").text();
const defaultJs = await Bun.file("./build/default.js").text();
const defaultTs = await Bun.file("./build/default.ts").text();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  root: "src/client/manager",
  base: "/manager/",
  build: {
    outDir: "../../../dist/manager",
    emptyOutDir: true,
  },

  define: {
    DEFAULT_RUST: `\`${defaultRust}\``,
    DEFAULT_JS: `\`${defaultJs}\``,
    DEFAULT_TS: `\`${defaultTs}\``,
  },
});
