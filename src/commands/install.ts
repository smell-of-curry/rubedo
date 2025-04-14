import {
  readManifest,
  getRubedoDependencies,
  getRubedoModulesDir,
  ensureDir,
} from "../utils/fs";
import { cloneDependency, getVersionDescription } from "../utils/git";

/**
 * Installs dependencies from the manifest.json
 */
export async function installCommand(): Promise<void> {
  try {
    console.log("Installing dependencies...");

    // Ensure the rubedo_modules directory exists
    await ensureDir(getRubedoModulesDir());

    // Read the manifest
    const manifest = await readManifest();

    // Get the Rubedo dependencies
    const dependencies = getRubedoDependencies(manifest);

    if (dependencies.length === 0) {
      console.log("No dependencies found in manifest.json");
      return;
    }

    console.log(`Found ${dependencies.length} dependencies:`);

    // Display dependency information
    dependencies.forEach((dep) => {
      console.log(
        `- ${dep.module_name} (${getVersionDescription(dep.version)})`
      );
    });

    console.log("\nCloning/updating repositories...");

    // Clone each dependency
    for (const dependency of dependencies) await cloneDependency(dependency);

    console.log("\nAll dependencies installed successfully!");
  } catch (error) {
    console.error("Error installing dependencies:", error);
    throw error;
  }
}
