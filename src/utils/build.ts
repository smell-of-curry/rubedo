import path from "path";
import fs from "fs-extra";
import { glob } from "glob";
import { getModulePath, readManifest, getRubedoDependencies } from "./fs";
import { Manifest, RubedoDependency } from "./types";
import { exec as _exec } from "child_process";
import { promisify } from "util";

const exec = promisify(_exec);

/**
 * Builds the TypeScript source code using esbuild
 * @param entryPoint The entry point of the application
 * @param outDir The output directory
 */
export async function buildSource(outDir: string = "build"): Promise<void> {
  console.log("Building source code...");

  await fs.ensureDir(outDir);

  // Run `npm run build` in the project directory
  await exec(`npm run build`, { cwd: process.cwd() });

  // Copy built scripts to the outDir
  const scripts = await glob("scripts/**/*.js", { cwd: process.cwd() });
  for (const script of scripts) {
    const destPath = path.join(outDir, script);
    await fs.copy(script, destPath);
  }

  console.log("Source code built successfully!");
}

/**
 * Copies assets from the rubedo_modules directory to the build directory
 * @param dependencies The Rubedo dependencies
 * @param outDir The output directory
 */
export async function copyDependencyAssets(
  dependencies: RubedoDependency[],
  outDir: string = "build"
): Promise<void> {
  console.log("Copying dependency assets...");

  for (const dep of dependencies) {
    const { module_name } = dep;
    const modulePath = getModulePath(module_name);

    // List of asset directories to copy
    const assetDirs = new Set([
      "animation_controllers",
      "animations",
      "blocks",
      "entities",
      "feature_rules",
      "features",
      "functions",
      "items",
      "loot_tables",
      "recipes",
      "spawn_rules",
      "structures",
      "texts",
    ]);

    for (const dir of assetDirs) {
      const sourcePath = path.join(modulePath, dir);

      // Skip if the directory doesn't exist
      if (!(await fs.pathExists(sourcePath))) continue;

      // Create the destination directory with the module name as a namespace
      // TODO: Add a namespace to the destination directory
      const [org, repo] = module_name.split("/");
      if (!org || !repo) {
        console.error(`Invalid module name: ${module_name}`);
        process.exit(1);
      }
      const destPath = path.join(outDir, dir, repo);

      if (dir === "texts") {
        // TODO: Create some type of merging system for texts, where we ignore pack.name and pack.description
        // But merge the rest of the file.
        continue;
      }

      if (dir === "entities") {
        // TODO; Create some type of system where we check if the current pack & all other dependencies
        // already have an entity with the same typeId.
        // If it does, we need to give a warning and skip the entity copy.
        continue;
      }

      if (dir === "functions") {
        // TODO: Create some type of system where we check if the current pack & all other dependencies
        // already have a function with the same path
        // If it does, we need to give a warning and skip the function copy.
        // This could break pretty bad so we need to create some way for the user to resolve this.
        continue;
      }

      // TODO: Handle rest of merging logic.

      // Copy the contents
      await fs.ensureDir(destPath);
      await fs.copy(sourcePath, destPath);

      console.log(`Copied ${dir} from ${module_name}`);
    }
  }

  console.log("Dependency assets copied successfully!");
}

/**
 * Merges the manifest.json file with the dependencies
 * @param manifest The manifest.json
 * @param outDir The output directory
 */
export async function mergeManifest(
  manifest: Manifest,
  outDir: string = "build"
): Promise<void> {
  console.log("Merging manifest...");

  // Create a deep copy of the manifest
  const mergedManifest: Manifest = JSON.parse(JSON.stringify(manifest));

  // Get the Rubedo dependencies
  const rubedoDependencies = getRubedoDependencies(manifest);

  // Add the dependencies to the manifest
  for (const dep of rubedoDependencies) {
    const { module_name } = dep;
    const modulePath = getModulePath(module_name);
    const manifestPath = path.join(modulePath, "manifest.json");

    // Skip if the manifest doesn't exist
    if (!(await fs.pathExists(manifestPath))) continue;

    // Read the dependency's manifest
    const depManifest = (await fs.readJSON(manifestPath)) as Manifest;

    // If the dependency has dependencies, add them to the manifest
    if (depManifest.dependencies) {
      mergedManifest.dependencies = mergedManifest.dependencies || [];

      for (const depDep of depManifest.dependencies) {
        // Check if the dependency already exists
        const exists = mergedManifest.dependencies.some(
          (d) => d.module_name === depDep.module_name
        );

        // Add the dependency if it doesn't exist
        if (!exists) {
          mergedManifest.dependencies.push(depDep);
        }
      }
    }

    // If the dependency has capabilities, add them to the manifest
    if (depManifest.capabilities) {
      mergedManifest.capabilities = mergedManifest.capabilities || [];

      for (const capability of depManifest.capabilities) {
        // Check if the capability already exists
        const exists = mergedManifest.capabilities.includes(capability);

        // Add the capability if it doesn't exist
        if (!exists) {
          mergedManifest.capabilities.push(capability);
        }
      }
    }
  }

  // Write the merged manifest
  await fs.writeJSON(path.join(outDir, "manifest.json"), mergedManifest, {
    spaces: 2,
  });

  console.log("Manifest merged successfully!");
}

/**
 * Copies project assets to the build directory
 * @param outDir The output directory
 */
export async function copyProjectAssets(
  outDir: string = "build"
): Promise<void> {
  console.log("Copying project assets...");

  // List of asset directories to copy
  const assetDirs = new Set([
    "animation_controllers",
    "animations",
    "blocks",
    "entities",
    "feature_rules",
    "features",
    "functions",
    "items",
    "loot_tables",
    "recipes",
    "spawn_rules",
    "structures",
    "texts",
  ]);

  for (const dir of assetDirs) {
    const sourcePath = path.join(process.cwd(), dir);

    // Skip if the directory doesn't exist
    if (!(await fs.pathExists(sourcePath))) {
      continue;
    }

    const destPath = path.join(outDir, dir);
    await fs.ensureDir(destPath);

    // Copy the contents
    await fs.copy(sourcePath, destPath);

    console.log(`Copied ${dir} from project`);
  }

  console.log("Project assets copied successfully!");
}

/**
 * Builds the addon
 */
export async function buildAddon(): Promise<void> {
  try {
    // Read the manifest
    const manifest = await readManifest();

    // Get the Rubedo dependencies
    const rubedoDependencies = getRubedoDependencies(manifest);

    // Create the build directory
    const buildDir = path.join(process.cwd(), "build");
    await fs.emptyDir(buildDir);

    // Build the source code
    await buildSource();

    // Copy dependency assets
    await copyDependencyAssets(rubedoDependencies);

    // Copy project assets
    await copyProjectAssets();

    // Merge the manifest
    await mergeManifest(manifest);

    console.log("Addon built successfully!");
  } catch (error) {
    console.error("Error building addon:", error);
    throw error;
  }
}
