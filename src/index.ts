import { Command } from "commander";
import { initCommand } from "./commands/init";
import { installCommand } from "./commands/install";
import { updateCommand } from "./commands/update";
import { buildCommand } from "./commands/build";
import { watchCommand } from "./commands/watch";

// Package.json info
import * as pkg from "../package.json";

const program = new Command();

program
  .name("rubedo")
  .description("A fast, lightweight, versatile MCBE addon linker")
  .version(pkg.version);

// Initialize a new Rubedo project
program
  .command("init")
  .description("Initialize a new Rubedo addon project")
  .action(initCommand);

// Install dependencies
program
  .command("install")
  .description("Install dependencies from manifest.json")
  .action(installCommand);

// Update dependencies
program
  .command("update")
  .description("Update dependencies to their latest versions")
  .action(updateCommand);

// Build the addon
program
  .command("build")
  .description("Build the addon")
  .action(buildCommand);

// Watch for changes and rebuild
program
  .command("watch")
  .description("Watch for changes and rebuild automatically")
  .action(watchCommand);

program.parse(process.argv);
