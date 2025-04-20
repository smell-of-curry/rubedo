import chokidar from 'chokidar';
import path from 'path';
import { buildAddon } from '../utils/build';
import { getRubedoModulesDir } from '../utils/fs';
import fs from 'fs';

/**
 * Watches for changes and rebuilds the addon
 */
export async function watchCommand(): Promise<void> {
  try {
    console.log('Watching for changes...');
    
    // Initial build
    await buildAddon();
    
    const cwd = process.cwd();
    console.log(`Current working directory: ${cwd}`);
    
    // Create a specific file watcher for problematic paths
    // Use absolute paths for better reliability on Windows
    const srcDir = path.resolve(cwd, 'src');
    const entitiesDir = path.resolve(cwd, 'entities');
    const lootTablesDir = path.resolve(cwd, 'loot_tables');
    const functionsDir = path.resolve(cwd, 'functions');
    const manifestFile = path.resolve(cwd, 'manifest.json');
    const rubedoModulesDir = getRubedoModulesDir();
    
    // Define watch paths with absolute paths
    const watchPaths = [
      srcDir,
      entitiesDir,
      lootTablesDir,
      functionsDir,
      manifestFile,
      rubedoModulesDir
    ].filter(p => fs.existsSync(p)); // Only watch paths that exist
    
    console.log('Watching the following paths:');
    watchPaths.forEach(pattern => console.log(` - ${pattern}`));
    
    // Track when we're building to prevent rebuild loops
    let building = false;
    let pendingBuild = false;
    let lastBuildTime = Date.now();
    let ignoredPaths = new Set<string>();
    
    // Minimum time between rebuilds to prevent loops
    const MIN_REBUILD_INTERVAL = 2000; 
    
    const watcher = chokidar.watch(watchPaths, {
      ignored: [
        /(^|[\/\\])\../, // Ignore dotfiles
        /(node_modules)/, // Ignore node_modules
        (path: string) => ignoredPaths.has(path) // Ignore paths modified during build
      ],
      persistent: true,
      ignoreInitial: true,
      usePolling: true,
      interval: 300,
      binaryInterval: 300,
      followSymlinks: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      },
      alwaysStat: true
    });
    
    const rebuild = async () => {
      const now = Date.now();
      
      // Prevent rebuild loops by enforcing minimum time between rebuilds
      if (now - lastBuildTime < MIN_REBUILD_INTERVAL) {
        console.log('Skipping rebuild: too soon after last build');
        return;
      }
      
      if (building) {
        pendingBuild = true;
        return;
      }
      
      building = true;
      lastBuildTime = now;
      
      try {
        console.log('\nChange detected, rebuilding...');
        
        // Temporarily pause the watcher to avoid rebuild loops
        watcher.unwatch(watchPaths);
        
        await buildAddon();
        
        console.log('Rebuild completed, watching for changes...');
      } catch (error) {
        console.error('Error rebuilding addon:', error);
      } finally {
        building = false;
        
        // Resume watching
        watcher.add(watchPaths);
        
        if (pendingBuild) {
          pendingBuild = false;
          setTimeout(rebuild, MIN_REBUILD_INTERVAL);
        }
      }
    };
    
    // Log all events for better debugging
    watcher.on('all', (event, filePath) => {
      console.log(`Change detected (${event}): ${filePath}`);
      rebuild();
    });
    
    watcher.on('error', error => {
      console.error(`Watcher error: ${error}`);
    });
    
    watcher.on('ready', () => {
      console.log('Initial scan complete. Ready to detect changes...');
      console.log('Watching for changes, press Ctrl+C to stop');
    });
  } catch (error) {
    console.error('Error watching for changes:', error);
    process.exit(1);
  }
} 