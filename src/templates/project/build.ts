import * as esbuild from "esbuild";
import * as fsExtra from "fs-extra";
const isDev = process.argv[2] === "dev";

// Scripts directory - this is where the compiled JavaScript will go
const scriptsDir = "./scripts";

// Create or empty the scripts directory
if (!fsExtra.pathExistsSync(scriptsDir)) {
  fsExtra.mkdirSync(scriptsDir);
} else {
  fsExtra.emptyDirSync(scriptsDir);
}

// Notification plugin for rebuild events in dev mode
const notificationPlugin: esbuild.Plugin = {
  name: 'notification-plugin',
  setup(build) {
    let buildStart = new Date();
    
    build.onStart(() => {
      buildStart = new Date();
      console.log(`\x1b[33m%s\x1b[0m`, `[${new Date().toLocaleTimeString()}]`, `🔄 Build started...`);
    });
    
    build.onEnd(result => {
      const duration = new Date().getTime() - buildStart.getTime();
      
      if (result.errors.length > 0) {
        console.error(
          `\x1b[31m%s\x1b[0m`,
          `[${new Date().toLocaleTimeString()}]`,
          `❌ Build failed with ${result.errors.length} error(s) in ${duration}ms`
        );
      } else {
        console.log(
          `\x1b[32m%s\x1b[0m`,
          `[${new Date().toLocaleTimeString()}]`,
          `✅ Build completed successfully in ${duration}ms for ${isDev ? "development" : "production"} mode`
        );
      }
    });
  }
};

console.log(`Building project in ${isDev ? "development" : "production"} mode...`);

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    outfile: "scripts/index.js",
    bundle: true,
    minify: !isDev,
    format: "esm",
    watch: isDev,
    sourcemap: isDev, // Source maps only in development mode
    plugins: [
      // Always include notification plugin for consistent logging
      notificationPlugin,
      // TODO: maybe rubedo resolver plugin here?
    ],
    external: [ // External Minecraft modules
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
  .then(() => {
    // Only display watching message in dev mode
    if (isDev) {
      console.log("\x1b[36m%s\x1b[0m", "Watching for changes..."); // Cyan text
    }
  })
  .catch((error) => {
    // Only log the detailed error object since the plugin already shows the error header
    console.error(error);
    process.exit(1);
  });
