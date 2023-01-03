const archiver = require("archiver");
const fs = require("fs-extra");
const esbuild = require("esbuild");
const path = require("path");
const isDev = process.argv[2] === "dev";

const ver = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"))
)?.version;
const name = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"))
)?.name;

esbuild
  .build({
    entryPoints: ["project/behavior/src/index.ts"],
    bundle: true,
    outfile: "project/behavior/scripts/index.js",
    minify: !isDev,
    platform: "neutral",
    watch: isDev,
    external: [
      "@minecraft/server",
      "@minecraft/server-ui",
      "@minecraft/server-net",
      "@minecraft/server-admin",
    ],
    legalComments: isDev ? "none" : "none",
  })
  .then(() => {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `[${new Date().toLocaleTimeString()}]`,
      `Built for ${isDev ? "development" : "production"}...`
    );

    if (!isDev) {
      const distDir = path.join(__dirname, "dist");
      buildPack("behavior",path.join(__dirname,"project","behavior"),distDir);
      buildPack("resource",path.join(__dirname,"project","resource"),distDir);
      buildPack("fullpack",distDir,distDir,".mcaddon");
    } else {
      console.log(
        `\x1b[31m%s\x1b[0m`,
        `[${new Date().toLocaleTimeString()}]`,"This feature is currently being worked on :P");
      process.exit(0);
    }
  });

function buildPack(fileName,target,destination,ext=".mcpack") {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const output = fs.createWriteStream(path.join(destination,fileName + "-" + name + "." + ver + ext));
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  archive.pipe(output);

  archive.directory(target, false)

  archive.finalize();
}
