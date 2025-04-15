import fs from "fs-extra";
import path from "path";
import { Manifest, RubedoDependency } from "./types";

/**
 * Reads the manifest.json file from the given directory
 * @param dir Directory to read the manifest from
 * @returns The parsed manifest.json
 */
export async function readManifest(
  dir: string = process.cwd()
): Promise<Manifest> {
  const manifestPath = path.join(dir, "manifest.json");
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`manifest.json not found in ${dir}`);
  }

  const manifest = (await fs.readJSON(manifestPath)) as Manifest; // TODO: Handle read errors
  return manifest;
}

/**
 * Gets the Rubedo dependencies from the manifest
 * @param manifest The parsed manifest.json
 * @returns The Rubedo dependencies
 */
export function getRubedoDependencies(manifest: Manifest): RubedoDependency[] {
  return manifest.rubedo_dependencies || [];
}

/**
 * Writes the manifest.json file to the given directory
 * @param manifest The manifest to write
 * @param dir Directory to write the manifest to
 */
export async function writeManifest(
  manifest: Manifest,
  dir: string = process.cwd()
): Promise<void> {
  const manifestPath = path.join(dir, "manifest.json");
  await fs.writeJSON(manifestPath, manifest, { spaces: 2 });
}

/**
 * Ensures that a directory exists
 * @param dir Directory to ensure exists
 */
export async function ensureDir(dir: string): Promise<void> {
  await fs.ensureDir(dir);
}

/**
 * Creates a directory if it doesn't exist
 * @param dir Directory to create
 */
export async function createDir(dir: string): Promise<void> {
  if (!(await fs.pathExists(dir))) {
    await fs.mkdir(dir);
  }
}

/**
 * Copies a directory
 * @param src Source directory
 * @param dest Destination directory
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

/**
 * Checks if a file exists
 * @param filePath Path to the file
 * @returns Whether the file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return await fs.pathExists(filePath);
}

/**
 * Gets the path to the rubedo_modules directory
 * @returns Path to the rubedo_modules directory
 */
export function getRubedoModulesDir(): string {
  return path.join(process.cwd(), "rubedo_modules");
}

/**
 * Gets the path to a specific module in the rubedo_modules directory
 * @param moduleName Name of the module (org/repo format)
 * @returns Path to the module
 */
export function getModulePath(moduleName: string): string {
  const [org, repo] = moduleName.split("/");
  if (!org || !repo) {
    console.error(`Invalid module name: ${moduleName}`);
    process.exit(1);
  }
  return path.join(getRubedoModulesDir(), org, repo);
}
