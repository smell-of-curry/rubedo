import fs from "fs-extra";
import path from "path";
import { Manifest, RubedoDependency } from "./types";
import ignore from "ignore";

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
 * Reads a .gitignore file and creates an ignore instance
 * @param dir Directory containing the .gitignore file
 * @returns An ignore instance
 */
export async function getGitIgnoreInstance(
  dir: string
): Promise<ReturnType<typeof ignore> | null> {
  const gitignorePath = path.join(dir, ".gitignore");

  if (!(await fs.pathExists(gitignorePath))) {
    return null;
  }

  try {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
    return ignore().add(gitignoreContent);
  } catch (error) {
    console.warn(`Error reading .gitignore in ${dir}:`, error);
    return null;
  }
}

/**
 * Checks if a file is ignored by gitignore rules
 * @param ig Ignore instance
 * @param filePath Absolute path to the file
 * @param srcDir Source directory containing the .gitignore file
 * @returns Whether the file is ignored
 */
export function isIgnoredByGitignore(
  ig: ReturnType<typeof ignore> | null,
  filePath: string,
  srcDir: string
): boolean {
  if (!ig) return false;

  // Convert absolute path to relative path from srcDir
  const relativePath = path.relative(srcDir, filePath);

  // Use forward slashes for consistency
  const normalizedPath = relativePath.replace(/\\/g, "/");

  return ig.ignores(normalizedPath);
}

/**
 * Copies a directory, respecting .gitignore rules if present
 * @param src Source directory
 * @param dest Destination directory
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  const ig = await getGitIgnoreInstance(src);

  if (!ig) {
    // No .gitignore file, use standard copy
    await fs.copy(src, dest);
    return;
  }

  // If there's a .gitignore file, do a custom recursive copy
  await fs.ensureDir(dest);

  // Get all files recursively
  const files = await getAllFiles(src);

  for (const file of files) {
    // Check if the file is ignored
    if (isIgnoredByGitignore(ig, file, src)) {
      continue;
    }

    const relativePath = path.relative(src, file);
    const targetPath = path.join(dest, relativePath);

    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(file, targetPath);
  }
}

/**
 * Gets all files in a directory recursively
 * @param dir Directory to scan
 * @returns Array of absolute file paths
 */
export async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function scanDir(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await scanDir(dir);
  return files;
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
  // Allow users to specify a custom modules directory via environment variable
  // This helps avoid Windows path length limitations
  const customPath = process.env['RUBEDO_MODULES_DIR'];
  if (customPath) return customPath;
  return path.join(process.cwd(), "rubedo_modules");
}

/**
 * Gets the path to a specific module in the rubedo_modules directory
 * @param moduleName Name of the module (org/repo format)
 * @param localPath Optional local path to use instead of the rubedo_modules directory
 * @returns Path to the module
 */
export function getModulePath(moduleName: string, localPath?: string): string {
  // If a local path is provided, use it directly
  if (localPath) {
    return localPath;
  }
  
  const [org, repo] = moduleName.split("/");
  if (!org || !repo) {
    console.error(`Invalid module name: ${moduleName}`);
    process.exit(1);
  }
  return path.join(getRubedoModulesDir(), org, repo);
}

/**
 * Copies a file or directory from source path to target path
 * @param sourcePath Source directory path
 * @param targetPath Target directory path
 * @param type The type of item to copy (dir or file)
 */
export async function copyFileOrDir(
  sourcePath: string,
  targetPath: string,
  type: "dir" | "file" = "dir"
): Promise<void> {
  try {
    // Ensure parent directory exists
    await fs.ensureDir(path.dirname(targetPath));

    // Remove existing target if it exists
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath);
    }

    // Copy the file or directory
    if (type === "dir") {
      await fs.copy(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
    console.log(`Copied: ${sourcePath} -> ${targetPath}`);
  } catch (error) {
    console.error(`Error copying: ${error}`);
    throw error;
  }
}
