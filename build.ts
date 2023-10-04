import { copyFile, mkdir, rm } from "fs/promises";

await rm("./dist", { recursive: true, force: true });
await mkdir("./dist");

await Bun.build({
  entrypoints: ["./src/client/worker/index.ts"],
  outdir: "./dist/worker",
  target: "browser",
  minify: true,
  publicPath: "/worker/",
});
await copyFile("./src/client/worker/index.html", "./dist/worker/index.html");
