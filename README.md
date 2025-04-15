# Rubedo - A fast, lightweight, versatile MCBE addon linker.

**Rubedo** is a fast, lightweight, and versatile tool designed to overcome the repetitive challenges of developing Minecraft Bedrock Script API addons. Rather than manually importing essential submodules (for commands, databases, forms, etc.) into every project source and modifying them to suit your project's structure, Rubedo provides a centralized system that:

- **Imports and manages external Script API projects** from GitHub as separate modules.
- **Automatically updates and links assets** (like entities, loot tables, functions, and more) into a unified build output.
- **Merges and extends the base Minecraft addon manifest** with a special field (`rubedo_dependencies`) so that your addon correctly references all externally managed modules.
- **Utilizes a fast build system** based on esbuild and custom asset linking logic to consolidate your custom source with dependency-provided code and assets.

## Whats the Purpose?

Currently when developing Minecraft Bedrock Script API Addons, often you find yourself needing to use the same
core features over and over again. Whether that be Custom Commands, Databases, Form APIs, Dynamic Property Wrappers or anything of the sort. You sadly need to import these files/folders 1 by 1 into your project source. Additionally modifying the source code to affix to your projects structure (world startup and such).

But imagine if there was a solution, a MCBE addon builder that allows you to import Script API Projects, Addons and smart bundling framework to create the perfect working environment for building large scale addons!

Rubedo aims to be that solution, providing a build framework not just smart but also strong. But here, enough talking check how it works...

## Manifest Format

Rubedo extends the standard Minecraft Bedrock manifest.json with a `rubedo_dependencies` field:

```json
{
  "format_version": 2,
  "header": {
    "name": "test-rubedo-addon",
    "description": "A Minecraft Bedrock addon built with Rubedo",
    "min_engine_version": [1, 21, 70],
    "uuid": "fccfa819-7bbd-4ec6-b870-4bc429835151",
    "version": [1, 0, 0]
  },
  "modules": [
    {
      "description": "Data Module",
      "type": "data",
      "uuid": "29713e70-db05-48af-9c4f-a4c7a35e8c53",
      "version": [1, 0, 0]
    },
    {
      "description": "Script API Module",
      "type": "script",
      "language": "javascript",
      "uuid": "178bd5a7-78c3-475d-a6c9-1ba8c3fb336d",
      "version": [1, 0, 0],
      "entry": "scripts/index.js"
    }
  ],
  "capabilities": ["script_eval"],
  "dependencies": [
    {
      "module_name": "@minecraft/server",
      "version": "2.0.0-beta"
    },
    {
      "module_name": "@minecraft/server-ui",
      "version": "2.0.0-beta"
    }
  ],
  "rubedo_dependencies": [
    {
      "module_name": "smell-of-curry/bedrock-item-database",
      "version": "latest"
    }
  ],
  "metadata": {
    "authors": ["smell of curry"],
    "license": "MIT",
    "url": "https://github.com/your-username/your-repo"
  }
}
```

### Version Formats

The `version` field in a Rubedo dependency can be:

- **Semantic Version** (`1.0.0`): Will checkout the tag `v1.0.0` from the repository
- **`latest`**: Will checkout the default branch and pull the latest changes
- **Commit Hash** (`a1b2c3d` or full hash): Will checkout the specific commit
- **Branch Name** (`main`, `develop`, etc.): Will checkout the specified branch

## Import Format

In your TypeScript code, you can import from dependencies using the format:

```typescript
import { SomeClass } from 'org/repo/src/path/to/file';
```

Imagine you had a project structure like this:

```
my-cool-addon/
├── manifest.json
├── scripts/
│   └── index.js
├── src/
│   ├── config/
│   ├── database/
│   └── lib/
│       ├── Command/
│       ├── DynamicPropertyWrapper/
│       ├── Events/
│       ├── Form/
│       └── timers.ts
│   ├── modules/
│   └── index.ts
├── build.ts               // A `esbuild` build system that builds `src`
├── package.json
└── tsconfig.json
```
*oh wait... thats kinda like [PokeBedrock](https://github.com/smell-of-curry/pokebedrock)*

Notice how inside the `src`, there is a `lib` where each individual module lives? Inside of each those is a project that could be separated into a different github with its own history. Doing so would allow other projects to import this module instead of keeping it locked to only be useable inside `my-cool-addon`.

Additionally inside `database` is some files like `ItemDatabase` which works as a way to store items inside minecraft bedrock (with full data) but for this project to work it needs a entity called `database:database` that allows it to store items on. Because of this when importing this module you also need to import the entity files and any other JSON files required (as minecraft addons normally have).

## So what does Rubedo Do?

Rubedo does just that! And so much more... 

So instead of that `my-cool-addon` I showed, take a look at the project structure of a rubedo addon:

```
my-cool-rubedo-addon/
├── manifest.json          // Base Minecraft addon manifest that will now include rubedo dependencies
├── entities/              // User's custom entities
├── loot_tables/           // User's custom loot tables
├── functions/             // User's custom functions (.mcfunction files)
├── scripts/
│   └── index.js
├── src/                   // User's custom source code (TypeScript, scripts, etc.)
│   └── index.ts           // Entry point for the user's code
├── rubedo_modules/        // Cloned dependency repositories (namespaced by dependency name)
│   └── smell-of-curry/bedrock-item-database/
│       ├── src/           // Dependency's TypeScript source
│       ├── entities/      // Dependency's entities (e.g., cow, sheep, etc.)
│       ├── loot_tables/   // Dependency's loot tables
│       └── manifest.json  // (Optional) Dependency's manifest info
├── build.ts               // A `esbuild` build system that builds your `modules` together with `src`.
├── package.json           // Standard TypeScript configuration for the project (importing rubedo)
└── tsconfig.json          // TypeScript configuration (that allows for reading of types from modules)
```

So it almost looks the exact same but just modifying on top of the original files. 

## Okay so how do I use it?

### 2.1. Manifest Extension and Dependency Declarations

Alright... your interested nice! Rubedo will change your addon development for the better but first you need to understand what is going on.

Inside your `manifest.json` Rubedo is extending this adding a new field `rubedo_dependencies`. This field works like `dependencies` inside your current `manifest.json` but is for Rubedo addons.

So take a look at how your `manifest.json` would look:

```json
{
  "format_version": 2,
  "header": {
    "name": "pack.name",
    "description": "pack.description",
    "min_engine_version": [1, 21, 70],
    "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "version": [1, 0, 0]
  },
  "modules": [
    {
      "description": "Data Module",
      "type": "data",
      "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "version": [1, 0, 0]
    },
    {
      "description": "Script API Module",
      "type": "script",
      "language": "javascript",
      "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "version": [1, 0, 0],
      "entry": "scripts/index.js"
    }
  ],
  "capabilities": ["script_eval"],
  "dependencies": [
    {
      "module_name": "@minecraft/server",
      "version": "2.0.0-beta"
    },
    {
      "module_name": "@minecraft/server-ui",
      "version": "2.0.0-beta"
    }
    // ... other dependencies (@minecraft/server-net, etc.)
  ],
  "rubedo_dependencies": [
    {
      "module_name": "smell-of-curry/bedrock-item-database",
      "version": "1.0.0"
    },
    {
      "module_name": "some-cool-person/some-amazing-addon",
      "version": "1.0.0"
    }
  ],
  "metadata": {
    "authors": ["Smell of curry"],
    "license": "MIT",
    "url": "https://github.com/smell-of-curry/cool-rubedo-addon"
  }
}
```

See... pretty simple, just add the `rubedo_dependencies` section to your `manifest.json`.

### 2.2. The Build Process

1. **Source and Module Resolution:**  
   During the build (triggered via `build.ts`), Rubedo extends esbuild with a custom resolver:
   - **Import mapping:** When the developer writes an import such as:
     ```ts
     import { ItemDatabase } from "smell-of-curry/bedrock-item-database/src/ItemDatabase.ts";
     ```
     the custom resolver intercepts this path and remaps it to the file inside `rubedo_modules/smell-of-curry/bedrock-item-database/src/ItemDatabase.ts`.  
   - **Asset Integration:** The build process also scans for non-code assets within each Rubedo module folder (like `entities/` or `loot_tables/`) and integrates them into the output directory by copying them into namespaced subdirectories. This ensures that every time you build, the assets are refreshed from the dependency source, thereby enforcing a "read-only" dependency principle.

2. **Bundling with esbuild:**  
   Rubedo's build script calls esbuild to bundle the user's custom TypeScript from the `src/` folder, as well as to include imports from external modules. It then:
   - **Applies custom plugins** for asset resolution if needed.
   - **Performs type mapping** so that any types exported from a dependency's TypeScript code are available to your project.
   - **Handles source maps and minification** following best practices (inspired by esbuild's fast bundling advantages).

3. **Manifest Merging:**  
   Once the files and assets have been collected, Rubedo automatically updates the base `manifest.json` to include metadata from your rubedo dependencies. This might include:
   - Injecting new dependency entries.
   - Adjusting version numbers and UUIDs to ensure there are no collisions.
   - Optionally, merging capabilities or additional metadata required by specific modules.

4. **Output:**  
   The final build is written into a dedicated `build/` directory, which contains:
   - The fully merged manifest.
   - Bundled JavaScript (or compiled code) ready for deployment.
   - Directories for assets (entities, loot_tables, etc.) properly mapped to be found by the Minecraft engine.

### 2.3. CLI Commands and Developer Workflow

Rubedo's CLI is built using TypeScript (using Commander.js) to expose commands such as:

- **`init`**  
  Scaffold a new Rubedo addon project. This command creates a sample `manifest.json`, populates a basic folder structure (including `src/` and an empty `rubedo_modules/`), and generates a starter `build.ts`.

- **`install`**  
  Read the `rubedo_dependencies` from `manifest.json` and clone (or update) the corresponding GitHub repositories into `rubedo_modules/`.

- **`update`**  
  Iterate through each dependency to perform Git updates (or API-based version checks) so the latest changes are always available.

- **`build`**  
  Invoke the build process. This command bundles the custom source code along with dependency modules, links all assets automatically, and produces the final output in `build/`. It also merges the manifest to include the rubedo dependencies' meta information.

- **`watch`**  
  Monitor changes in your `src/` and `rubedo_modules/` directories. When a file is changed (or an asset is updated), automatically rebuild the final output (using esbuild's watch mode in conjunction with custom asset remapping logic).

## Build Script

Rubedo provides a powerful build script template that you can customize for your needs. The default build script includes:

### Features

- **Development mode**: Run with `npm run build:dev` or `npm run watch`
- **Production mode**: Run with `npm run build` or `npm run build:prod`
- **Watch mode**: Automatically rebuilds when files change (with `npm run watch`)
- **External module handling**: Properly excludes Minecraft APIs from bundling
- **Source maps**: Generated in development mode for easier debugging
- **Minification**: Applied in production mode to reduce file size

### Optional Integrations

The build script includes commented examples for integrating:

- **Sentry error tracking**: For monitoring runtime errors in your addon
- **Custom plugin support**: Easily extend with your own esbuild plugins

### Example Build Script

```typescript
import * as esbuild from 'esbuild';
import * as fsExtra from 'fs-extra';

// Optional: import error tracking
// import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";

const isDev = process.argv[2] === "dev";
const scriptsDir = "./build/scripts";

// Ensure output directory exists
if (!fsExtra.pathExistsSync(scriptsDir)) {
  fsExtra.mkdirSync(scriptsDir, { recursive: true });
}
fsExtra.emptyDirSync(scriptsDir);

esbuild.build({
  entryPoints: ["src/index.ts"],
  outfile: "build/scripts/index.js",
  bundle: true,
  minify: !isDev,
  format: "esm",
  watch: isDev,
  sourcemap: 'inline',
  external: [
    "@minecraft/server",
    "@minecraft/server-ui",
    // Other Minecraft modules...
  ],
  // Add your custom plugins here
}).catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
```

### Customizing Your Build

You can modify the build script to add custom plugins, change build settings, or integrate with other tools. Just edit the `build.ts` file in your project root.

## Advanced Concepts and Future Enhancements

### 3.1. Automated Conflict and Version Management

Rubedo may need to handle cases where:
- **Files with the same name** from different modules could conflict. This is managed by namespacing files under directories named after the dependency (e.g., `entities/bedrock-item-database/`).
- **Version mismatches** arise; in such cases, Rubedo warns the developer or require manual intervention to fork a module.

### 3.2. Incremental and Efficient Rebuilds

Rubedo's build system, built on top of esbuild, benefits from incremental compilation:
- **Watch Mode and Live Updates:** Rapid detection of changes through libraries such as chokidar can trigger only the necessary parts of the rebuild.
- **Asset Caching:** Files in `rubedo_modules/` could be cached, with Rubedo only re-copying files that have changed.

### 3.3. Extensible Plugin Architecture

- Custom asset processing (for different file types like JSON, images, or even world-generation settings).
- Integration with additional services or version tracking systems.
- User-defined customization of the manifest merging strategy.

### 3.4. Web-Based Interface (Desktop App Evolution)

Although Rubedo starts as a CLI tool, there is potential to:
- **Wrap Rubedo with Electron or similar frameworks** to provide a desktop GUI (like Github Desktop).
- **Interactive configuration management:** Allow users to visually manage dependencies and see a real-time preview of their manifest and file structure.


