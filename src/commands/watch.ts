import chokidar from 'chokidar';
import path from 'path';
import { buildAddon } from '../utils/build';
import { getRubedoModulesDir } from '../utils/fs';

/**
 * Watches for changes and rebuilds the addon
 */
export async function watchCommand(): Promise<void> {
  try {
    console.log('Watching for changes...');
    
    // Initial build
    await buildAddon();
    
    // Start watching for changes
    const watcher = chokidar.watch([
      path.join(process.cwd(), 'src/**/*'),
      path.join(process.cwd(), 'entities/**/*'),
      path.join(process.cwd(), 'loot_tables/**/*'),
      path.join(process.cwd(), 'functions/**/*'),
      path.join(process.cwd(), 'manifest.json'),
      path.join(getRubedoModulesDir(), '**/*')
    ], {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });
    
    let building = false;
    let pendingBuild = false;
    
    const rebuild = async () => {
      if (building) {
        pendingBuild = true;
        return;
      }
      
      building = true;
      
      try {
        console.log('\nChange detected, rebuilding...');
        await buildAddon();
        console.log('Rebuild completed, watching for changes...');
      } catch (error) {
        console.error('Error rebuilding addon:', error);
      } finally {
        building = false;
        
        if (pendingBuild) {
          pendingBuild = false;
          rebuild();
        }
      }
    };
    
    watcher.on('all', (event, filePath) => {
      console.log(`Change detected (${event}): ${filePath}`);
      rebuild();
    });
    
    console.log('Watching for changes, press Ctrl+C to stop');
  } catch (error) {
    console.error('Error watching for changes:', error);
    process.exit(1);
  }
} 