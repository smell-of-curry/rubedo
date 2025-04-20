import { buildAddon } from '../utils/build';
import { displayUpdateAvailableMessage } from '../utils/messages';

/**
 * Builds the addon
 * @param options Command options
 */
export async function buildCommand(options: {
  skipUpdateCheck?: boolean
} = {}): Promise<void> {
  try {
    console.log('Building addon...');
    
    const result = await buildAddon({
      skipUpdateCheck: options.skipUpdateCheck === true ? true : undefined 
    });
    
    if (result.updatesAvailable && result.updatedDependencies) {
      displayUpdateAvailableMessage(result.updatedDependencies, 'build');
    } else {
      console.log('Addon built successfully!');
    }
  } catch (error) {
    console.error('Error building addon:', error);
    process.exit(1);
  }
} 