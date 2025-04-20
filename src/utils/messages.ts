import { RubedoDependency } from "./types";

/**
 * Displays a message about available updates for dependencies
 * @param dependencies The dependencies with updates available
 * @param commandName The command name for skip-update-check option (e.g. 'build' or 'watch')
 */
export function displayUpdateAvailableMessage(
  dependencies: RubedoDependency[],
  commandName: string
): void {
  console.log('\n⚠️ Some Rubedo dependencies have updates available:');
  dependencies.forEach(dep => {
    console.log(`  - ${dep.module_name} (${dep.version})`);
  });
  console.log('\nIt is recommended to run `rubedo install` to update these dependencies.');
  console.log(`You can also run \`rubedo ${commandName} --skip-update-check\` to skip this check.\n`);
} 