import path from "path";
import fs from "fs-extra";
import { 
  getModulePath, 
  readManifest, 
  getRubedoDependencies,
  copyFileOrDir
} from "./fs";
import { Manifest, RubedoDependency } from "./types";
import { execWithLog } from "./exec";
import { checkForUpdates } from "./git";

/**
 * Builds the TypeScript source code using esbuild
 */
export async function buildSource(): Promise<void> {
  console.log("Building source code...");

  // No need to copy to a build directory, just run the project's build script
  await execWithLog(`npm run build`, { cwd: process.cwd() });

  console.log("Source code built successfully!");
}

/**
 * Copies dependency asset directories to the project
 * @param dependencies The Rubedo dependencies
 */
export async function linkDependencyAssets(
  dependencies: RubedoDependency[]
): Promise<void> {
  console.log("Copying dependency assets...");

  for (const dep of dependencies) {
    const { module_name } = dep;
    const modulePath = getModulePath(module_name);

    // List of asset directories to link
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
      switch (dir) {
        case "texts":
          // TODO: Create some type of merging system for texts, where we ignore pack.name and pack.description
          continue;
        case "entities":
          // TODO; Create some type of system where we check if the current pack & all other dependencies
          // already have an entity with the same typeId.
          // If it does, we need to give a warning and skip the entity copy.
          break;
        case "functions":
          // TODO: Create some type of system where we check if the current pack & all other dependencies
          // already have a function with the same path.
          // If it does, we need to give a warning and skip the function copy.
          // This could break pretty bad so we need to create some way for the user to resolve this.
          break;
        default:
          break;
      }

      const sourcePath = path.join(modulePath, dir);

      // Skip if the directory doesn't exist
      if (!(await fs.pathExists(sourcePath))) continue;

      // Create the destination directory with the module name as a namespace
      const [org, repo] = module_name.split("/");
      if (!org || !repo) {
        console.error(`Invalid module name: ${module_name}`);
        process.exit(1);
      }
      
      // First ensure the base asset directory exists
      const baseDir = path.join(process.cwd(), dir);
      await fs.ensureDir(baseDir);
      
      // Copy the module's asset directory
      const namespaceDir = path.join(process.cwd(), dir, repo);
      await copyFileOrDir(sourcePath, namespaceDir, 'dir');

      console.log(`Copied ${dir} from ${module_name}`);
    }
  }

  console.log("Dependency assets copied successfully!");
}

/**
 * Merges the manifest.json file with the dependencies
 * @param manifest The manifest.json
 */
export async function mergeManifest(
  manifest: Manifest
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

  // Write the merged manifest to the project root (overwriting the existing one)
  await fs.writeJSON(path.join(process.cwd(), "manifest.json"), mergedManifest, {
    spaces: 2,
  });

  console.log("Manifest merged successfully!");
}

/**
 * Builds the addon
 * @param options Build options
 * @returns Object containing build info or update info
 */
export async function buildAddon(options: {
  skipUpdateCheck?: boolean | undefined;
} = {}): Promise<{
  success: boolean;
  updatesAvailable?: boolean;
  updatedDependencies?: RubedoDependency[];
}> {
  try {
    // Read the manifest
    const manifest = await readManifest();

    // Get the Rubedo dependencies
    const rubedoDependencies = getRubedoDependencies(manifest);

    // Check for updates if requested and not explicitly skipped
    if (!options.skipUpdateCheck) {
      const dependenciesWithUpdates = await checkForUpdates(rubedoDependencies);
      
      if (dependenciesWithUpdates.length > 0) {
        return {
          success: true,
          updatesAvailable: true,
          updatedDependencies: dependenciesWithUpdates
        };
      }
    }

    // Build the source code (produces JavaScript in the scripts directory)
    await buildSource();

    // Copy dependency assets
    await linkDependencyAssets(rubedoDependencies);

    // Merge the manifest
    await mergeManifest(manifest);

    return { success: true };
  } catch (error) {
    console.error("Error building addon:", error);
    throw error;
  }
}
