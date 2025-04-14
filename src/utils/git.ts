import simpleGit, { SimpleGit } from "simple-git";
import path from "path";
import { ensureDir, getModulePath } from "./fs";
import { RubedoDependency } from "./types";
import fs from "fs-extra";

/**
 * Gets the GitHub URL for a module
 * @param moduleName Name of the module (org/repo format)
 * @returns The GitHub URL
 */
export function getGitHubUrl(moduleName: string): string {
  return `https://github.com/${moduleName}.git`;
}

/**
 * Clones a repository from GitHub
 * @param dependency The dependency to clone
 * @returns Path to the cloned repository
 */
export async function cloneDependency(
  dependency: RubedoDependency
): Promise<string> {
  const { module_name, version } = dependency;
  const [org] = module_name.split("/");
  if (!org) {
    console.error(`Invalid module name: ${module_name}`);
    process.exit(1);
  }
  const orgDir = path.join(path.resolve(process.cwd(), "rubedo_modules"), org);

  await ensureDir(orgDir);

  const git: SimpleGit = simpleGit();
  const repoPath = getModulePath(module_name);

  // Check if the repository already exists
  if (await fs.pathExists(repoPath)) {
    console.log(`Repository ${module_name} already exists, updating...`);
    await updateDependency(dependency);
    return repoPath;
  }

  // Clone the repository
  // TODO: Add a progress bar
  // TODO: Allow for users to use a local path
  console.log(`Cloning ${module_name}...`);
  await git.clone(getGitHubUrl(module_name), repoPath);

  // Checkout the specified version
  console.log(`Checking out ${getVersionDescription(version)}...`);
  await checkoutVersion(dependency);

  console.log(
    `Repository ${module_name} cloned and checked out to ${getVersionDescription(
      version
    )}`
  );

  return repoPath;
}

/**
 * Updates a dependency to the version specified in the manifest
 * @param dependency The dependency to update
 */
export async function updateDependency(
  dependency: RubedoDependency
): Promise<void> {
  const { module_name, version } = dependency;
  const repoPath = getModulePath(module_name);

  // Check if the repository exists
  if (!(await fs.pathExists(repoPath))) {
    console.log(`Repository ${module_name} does not exist, cloning...`);
    await cloneDependency(dependency);
    return;
  }

  // Update the repository
  console.log(`Updating ${module_name}...`);
  const git: SimpleGit = simpleGit(repoPath);

  try {
    await git.fetch("origin");
    console.log(`Checking out ${getVersionDescription(version)}...`);
    await checkoutVersion(dependency);
    console.log(
      `Repository ${module_name} updated to ${getVersionDescription(version)}`
    );
  } catch (error) {
    console.error(`Error updating ${module_name}:`, error);
    throw error;
  }
}

/**
 * Checks out a specific version of a dependency
 * @param dependency The dependency to checkout
 */
export async function checkoutVersion(
  dependency: RubedoDependency
): Promise<void> {
  const { module_name, version } = dependency;
  const repoPath = getModulePath(module_name);

  const git: SimpleGit = simpleGit(repoPath);

  try {
    if (version === "latest") {
      // Get the default branch
      const branches = await git.branch();
      const defaultBranch = branches.current;

      // Pull the latest changes
      await git.pull("origin", defaultBranch);
    } else if (version.match(/^\d+\.\d+\.\d+$/)) {
      // Assuming version is a tag like "1.0.0"
      await git.checkout(`tags/v${version}`);
    } else if (version.match(/^[0-9a-f]{40}$/)) {
      // Version is a full commit hash
      await git.checkout(version);
    } else if (version.match(/^[0-9a-f]{7,8}$/)) {
      // Version is a short commit hash
      await git.checkout(version);
    } else {
      // Assuming version is a branch or specific commit
      await git.checkout(version);
    }
  } catch (error) {
    console.error(
      `Error checking out version ${version} for ${module_name}:`,
      error
    );
    throw error;
  }
}

/**
 * Gets a human-readable description of a dependency version
 * @param version The version string
 * @returns A human-readable description
 */
export function getVersionDescription(version: string): string {
  if (version === "latest") {
    return "latest version";
  } else if (version.match(/^\d+\.\d+\.\d+$/)) {
    return `version ${version}`;
  } else if (version.match(/^[0-9a-f]{40}$/)) {
    return `commit ${version.substring(0, 7)}...`;
  } else if (version.match(/^[0-9a-f]{7,8}$/)) {
    return `commit ${version}`;
  } else {
    return `branch or ref '${version}'`;
  }
}
