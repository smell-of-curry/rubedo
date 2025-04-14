import { buildAddon } from '../utils/build';

/**
 * Builds the addon
 */
export async function buildCommand(): Promise<void> {
  try {
    console.log('Building addon...');
    
    await buildAddon();
    
    console.log('Addon built successfully!');
  } catch (error) {
    console.error('Error building addon:', error);
    process.exit(1);
  }
} 