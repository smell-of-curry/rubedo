import simpleGit, { SimpleGit } from "simple-git";
import { getModulePath } from "./fs";
import { RubedoDependency } from "./types";
import fs from "fs-extra";
import { execWithLog } from "./exec";
import path from "path";

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
  const { module_name, version, localPath } = dependency;
  const [org] = module_name.split("/");
  if (!org) {
    console.error(`Invalid module name: ${module_name}`);
    process.exit(1);
  }

  const git: SimpleGit = simpleGit();
  const repoPath = getModulePath(module_name);

  // Check if the repository already exists
  if (await fs.pathExists(repoPath)) {
    console.log(`Repository ${module_name} already exists, updating...`);
    await updateDependency(dependency);
    return repoPath;
  }

  // If a local path is provided, copy from that location instead of cloning
  if (localPath) {
    if (!(await fs.pathExists(localPath))) {
      console.error(`Local path does not exist: ${localPath}`);
      process.exit(1);
    }
    
    console.log(`Using local repository from ${localPath}...`);
    // Ensure the parent directory exists
    await fs.ensureDir(path.dirname(repoPath));
    
    // Copy the contents from the local path to the repository path
    // Make sure source and destination are different
    if (localPath !== repoPath) {
      await fs.copy(localPath, repoPath);
    } else {
      console.log(`Source and destination are the same, skipping copy.`);
    }
    
    console.log(`Repository ${module_name} linked from local path ${localPath}`);
    return repoPath;
  }

  // Clone the repository from GitHub
  console.log(`Cloning ${module_name}...`);
  await git.clone(getGitHubUrl(module_name), repoPath);

  // Checkout the specified version
  console.log(`Checking out ${getVersionDescription(version, localPath)}...`);
  await checkoutVersion(dependency);

  if (process.env['RUBEDO_MODULES_DIR']) {
    // run `npm install` in the repo as it is installed in a different directory
    console.log(`Running npm install in ${repoPath}...`);
    await execWithLog(`npm install`, { cwd: repoPath });
  }

  console.log(
    `Repository ${module_name} cloned and checked out to ${getVersionDescription(
      version,
      localPath
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
  const { module_name, version, localPath } = dependency;
  const repoPath = getModulePath(module_name);

  // Check if the repository exists
  if (!(await fs.pathExists(repoPath))) {
    console.log(`Repository ${module_name} does not exist, cloning...`);
    await cloneDependency(dependency);
    return;
  }

  // If local path is provided, update from that path
  if (localPath) {
    if (!(await fs.pathExists(localPath))) {
      console.error(`Local path does not exist: ${localPath}`);
      process.exit(1);
    }
    
    console.log(`Updating ${module_name} from local path ${localPath}...`);
    
    // Make sure source and destination are different
    if (localPath !== repoPath) {
      // Remove the existing files and copy the new ones
      await fs.emptyDir(repoPath);
      await fs.copy(localPath, repoPath);
    } else {
      console.log(`Source and destination are the same, skipping copy.`);
    }

    // run `npm install` on the local path to ensure dependencies are installed
    await execWithLog(`npm install`, { cwd: localPath });
    
    console.log(`Repository ${module_name} updated from local path ${localPath}`);
    return;
  }

  // Update the repository from GitHub
  console.log(`Updating ${module_name}...`);
  const git: SimpleGit = simpleGit(repoPath);

  try {
    await git.fetch("origin");
    console.log(`Checking out ${getVersionDescription(version, localPath)}...`);
    await checkoutVersion(dependency);

    if (process.env['RUBEDO_MODULES_DIR']) {
      // run `npm install` in the repo as it is installed in a different directory
      console.log(`Running npm install in ${repoPath}...`);
      await execWithLog(`npm install`, { cwd: repoPath });
    }
    
    console.log(
      `Repository ${module_name} updated to ${getVersionDescription(version, localPath)}`
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
  const { module_name, version, localPath } = dependency;
  const repoPath = getModulePath(module_name);

  // Skip checkout for local paths
  if (localPath) {
    console.log(`Using local repository from ${localPath}, skipping checkout.`);
    return;
  }

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
 * @param localPath Optional local path to the repository
 * @returns A human-readable description
 */
export function getVersionDescription(version: string, localPath?: string): string {
  if (localPath) {
    return `local path ${localPath}`;
  } else if (version === "latest") {
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

/**
 * Checks if updates are available for a dependency
 * @param dependency The dependency to check
 * @returns True if updates are available, false otherwise
 */
export async function hasUpdates(
  dependency: RubedoDependency
): Promise<boolean> {
  const { module_name, version, localPath } = dependency;
  const repoPath = getModulePath(module_name);

  // Check if the repository exists
  if (!(await fs.pathExists(repoPath))) {
    // Repository doesn't exist, so it needs to be installed
    return true;
  }

  // If local path is provided, no need to check for updates
  // The directory link will always reflect the current state of the local path
  if (localPath) {
    // Check if it's correctly linked (symlink or junction)
    try {
      const stats = await fs.lstat(repoPath);
      if (stats.isSymbolicLink()) {
        const linkTarget = await fs.readlink(repoPath);
        // If it's not pointing to the correct location, it needs an update
        return path.resolve(linkTarget) !== path.resolve(localPath);
      } else {
        // Not a symlink, so it needs to be updated to become a symlink
        return true;
      }
    } catch (error) {
      console.log(`Error checking symlink for ${module_name}, assuming update needed`);
      return true;
    }
  }

  // Check if it's a symlink (from a previous local path config)
  try {
    const stats = await fs.lstat(repoPath);
    if (stats.isSymbolicLink()) {
      // It's a symlink but shouldn't be, since localPath is not provided
      return true;
    }
  } catch (error) {
    // Ignore errors and continue with git check
  }

  // For git repositories
  const git: SimpleGit = simpleGit(repoPath);
  try {
    await git.fetch("origin");
    
    if (version === "latest") {
      // Get the default branch
      const branches = await git.branch();
      const defaultBranch = branches.current;
      
      // Check if there are any changes
      const status = await git.status();
      return status.behind > 0;
    } else if (version.match(/^\d+\.\d+\.\d+$/)) {
      // Version is a tag like "1.0.0", check if we're on that tag
      const currentTag = await getCurrentTag(git);
      return currentTag !== `v${version}`;
    } else if (version.match(/^[0-9a-f]{40}$/) || version.match(/^[0-9a-f]{7,8}$/)) {
      // Version is a commit hash, check if we're on that commit
      const currentCommit = await git.revparse(['HEAD']);
      return !currentCommit.startsWith(version);
    } else {
      // Version is a branch, check if we're on that branch and if there are updates
      const currentBranch = (await git.branch()).current;
      if (currentBranch !== version) {
        return true;
      }
      
      const status = await git.status();
      return status.behind > 0;
    }
  } catch (error) {
    console.log(`Error checking updates for ${module_name}, assuming update needed:`, error);
    return true;
  }
}

/**
 * Gets the current tag for a repository
 * @param git SimpleGit instance
 * @returns The current tag or null if not on a tag
 */
async function getCurrentTag(git: SimpleGit): Promise<string | null> {
  try {
    const tags = await git.tags();
    const currentCommit = await git.revparse(['HEAD']);
    
    for (const tag of tags.all) {
      const tagCommit = await git.revparse([tag]);
      if (tagCommit === currentCommit) {
        return tag;
      }
    }
    
    return null;
  } catch (error) {
    console.log(`Error getting current tag:`, error);
    return null;
  }
}

/**
 * Checks if any dependencies have updates available
 * @param dependencies List of dependencies to check
 * @returns Array of dependencies that have updates available
 */
export async function checkForUpdates(
  dependencies: RubedoDependency[]
): Promise<RubedoDependency[]> {
  const dependenciesWithUpdates: RubedoDependency[] = [];
  
  for (const dependency of dependencies) {
    try {
      if (await hasUpdates(dependency)) {
        dependenciesWithUpdates.push(dependency);
      }
    } catch (error) {
      console.error(`Error checking updates for ${dependency.module_name}:`, error);
    }
  }
  
  return dependenciesWithUpdates;
}
