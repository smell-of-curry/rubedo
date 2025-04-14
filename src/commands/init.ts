import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ensureDir } from '../utils/fs';

/**
 * Initializes a new Rubedo project
 */
export async function initCommand(): Promise<void> {
  try {
    console.log('Initializing a new Rubedo project...');
    
    // Create directories
    const directories = [
      'src',
      'rubedo_modules',
      'entities',
      'loot_tables',
      'functions'
    ];
    
    for (const dir of directories) {
      await ensureDir(path.join(process.cwd(), dir));
      console.log(`Created directory: ${dir}`);
    }
    
    // Copy `manifest.json` from templates/project
    await fs.copy(
      path.join(__dirname, '../templates/project/manifest.json'),
      path.join(process.cwd(), 'manifest.json')
    );
    console.log('Created manifest.json');

    // Replace UUIDs in manifest.json
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const updatedManifest = manifestContent
      .replace('{{UUID1}}', uuidv4())
      .replace('{{UUID2}}', uuidv4())
      .replace('{{UUID3}}', uuidv4());
    
    await fs.writeFile(manifestPath, updatedManifest);
    console.log('Updated manifest.json with UUIDs');
    
    // Copy `src/index.ts` from templates/project
    await fs.copy(
      path.join(__dirname, '../templates/project/src/index.ts'),
      path.join(process.cwd(), 'src', 'index.ts')
    );
    console.log('Created src/index.ts');
    
    // Copy `src/index.ts` from templates/project
    await fs.copy(
      path.join(__dirname, '../templates/project/src/index.ts'),
      path.join(process.cwd(), 'src', 'index.ts')
    );
    console.log('Created src/index.ts');
    
    // Copy `build.ts` from templates/project
    await fs.copy(
      path.join(__dirname, '../templates/project/build.ts'),
      path.join(process.cwd(), 'build.ts')
    );
    console.log('Created build.ts');
    
    // Copy `tsconfig.json` from templates/project
    await fs.copy(
      path.join(__dirname, '../templates/project/tsconfig.json'),
      path.join(process.cwd(), 'tsconfig.json')
    );
    console.log('Created tsconfig.json');
    
    // Copy `package.json` from templates/project
    await fs.copy(
      path.join(__dirname, '../templates/project/package.json'),
      path.join(process.cwd(), 'package.json')
    );
    console.log('Created package.json');
    
    // Copy `.gitignore` from templates/project
    await fs.copy(
      path.join(__dirname, '../templates/project/.gitignore'),
      path.join(process.cwd(), '.gitignore')
    );
    console.log('Created .gitignore');
    
    console.log('\nRubedo project initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Edit manifest.json to add your project details');
    console.log('2. Add dependencies to the Rubedo module in manifest.json, for example:');
    console.log('   {');
    console.log('     "module_name": "organization/repo-name",');
    console.log('     "version": "latest"          // For latest changes');
    console.log('   },');
    console.log('   {');
    console.log('     "module_name": "organization/repo-name",');
    console.log('     "version": "1.0.0"           // For specific version tag');
    console.log('   },');
    console.log('   {');
    console.log('     "module_name": "organization/repo-name",');
    console.log('     "version": "a1b2c3d"         // For specific commit hash');
    console.log('   }');
    console.log('3. Run `npm install` to install dependencies');
    console.log('4. Start developing in src/index.ts');
    console.log('5. Run `rubedo build` to build your addon');
  } catch (error) {
    console.error('Error initializing project:', error);
    throw error;
  }
} 