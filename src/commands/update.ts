import { readManifest, getRubedoDependencies } from '../utils/fs';
import { updateDependency, getVersionDescription } from '../utils/git';

/**
 * Updates dependencies to their latest versions
 */
export async function updateCommand(): Promise<void> {
  try {
    console.log('Updating dependencies...');
    
    // Read the manifest
    const manifest = await readManifest();
    
    // Get the Rubedo dependencies
    const dependencies = getRubedoDependencies(manifest);
    
    if (dependencies.length === 0) {
      console.log('No dependencies found in manifest.json');
      return;
    }
    
    console.log(`Found ${dependencies.length} dependencies:`);
    
    // Display dependency information
    dependencies.forEach(dep => {
      console.log(`- ${dep.module_name} (${getVersionDescription(dep.version)})`);
    });
    
    console.log('\nUpdating repositories...');
    
    // Update each dependency
    for (const dependency of dependencies) {
      await updateDependency(dependency);
    }
    
    console.log('\nAll dependencies updated successfully!');
  } catch (error) {
    console.error('Error updating dependencies:', error);
    throw error;
  }
} 