import * as esbuild from "esbuild";
import * as fsExtra from "fs-extra";
const isDev = process.argv[2] === "dev";

const dir = "./scripts";

if (!fsExtra.pathExists(dir)) {
  fsExtra.mkdirSync(dir);
}
fsExtra.emptyDirSync(dir);

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    outfile: "scripts/index.js",
    bundle: true,
    minify: !isDev,
    format: "esm",
    watch: isDev,
    sourcemap: true, // Source map generation must be turned on
    plugins: [
      // TODO: maybe rubedo resolver plugin here?
    ],
    external: [ // Need to link minecraft modules.
      "@minecraft/server",
      "@minecraft/server-ui",
      "@minecraft/server-admin",
      "@minecraft/server-gametest",
      "@minecraft/server-net",
      "@minecraft/server-common",
      "@minecraft/server-editor",
      "@minecraft/debug-utilities",
      "@minecraft/diagnostics",
    ],
    legalComments: isDev ? "none" : "none",
    mainFields: ["main"], // Needed for @minecraft/math and @minecraft/vanilla-data
  })
  .then((_r) => {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `[${new Date().toLocaleTimeString()}]`,
      `Built for ${isDev ? "development" : "production"}...`
    );
  })
  .catch((error) => {
    console.error(error);
  });
