import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    entry: "./src/index.ts",
    resolve: true,
  },
  external: ["virtual:docsmith"], // Add this line to mark virtual module as external
  splitting: false,
  clean: true,
  sourcemap: true,
});
