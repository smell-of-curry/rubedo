import path from 'path';
import { copyDir } from '../utils/fs';

async function copyTemplates() {
  console.log('Copying templates while respecting .gitignore files...');
  
  try {
    // Get source and destination paths
    const sourcePath = path.resolve(__dirname, '../../src/templates/project');
    const destPath = path.resolve(__dirname, '../../dist/templates/project');
    
    // Use our enhanced copyDir function that respects .gitignore
    await copyDir(sourcePath, destPath);
    
    console.log('Templates copied successfully!');
  } catch (error) {
    console.error('Error copying templates:', error);
    process.exit(1);
  }
}

// Execute the copy
copyTemplates(); 