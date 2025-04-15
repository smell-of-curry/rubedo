import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {fileExists } from '../utils/fs';
import { promptForConfirmation, promptForText } from '../utils/prompt';
import { execWithLog } from '../utils/exec';

/**
 * Gets the current directory name, which can be used as a default project name
 * @returns The name of the current directory
 */
function getCurrentDirName(): string {
  return path.basename(process.cwd());
}

/**
 * Initializes a new Rubedo project
 */
export async function initCommand(): Promise<void> {
  try {
    console.log('Initializing a new Rubedo project...');
    
    // Prompt for project details
    const projectName = await promptForText('Package name', getCurrentDirName());
    const projectVersion = await promptForText('Version', '1.0.0');
    const projectDescription = await promptForText('Description', 'A Minecraft Bedrock addon built with Rubedo');
    const projectAuthor = await promptForText('Author');
    const projectRepo = await promptForText('Git repository');
    const projectLicense = await promptForText('License', 'MIT');
    
    console.log('\nProject configuration:');
    console.log(`  - Name: ${projectName}`);
    console.log(`  - Version: ${projectVersion}`);
    console.log(`  - Description: ${projectDescription}`);
    console.log(`  - Author: ${projectAuthor}`);
    console.log(`  - Repository: ${projectRepo}`);
    console.log(`  - License: ${projectLicense}`);
    
    const confirmProject = await promptForConfirmation('Is this OK?', true);
    
    if (!confirmProject) {
      console.log('Project initialization cancelled');
      return;
    }
    
    // List of files to copy from templates
    const filesToCopy = [
      {
        src: path.join(__dirname, '../templates/project/manifest.json'),
        dest: path.join(process.cwd(), 'manifest.json'),
        name: 'manifest.json'
      },
      {
        src: path.join(__dirname, '../templates/project/src/index.ts'),
        dest: path.join(process.cwd(), 'src', 'index.ts'),
        name: 'src/index.ts'
      },
      {
        src: path.join(__dirname, '../templates/project/build.ts'),
        dest: path.join(process.cwd(), 'build.ts'),
        name: 'build.ts'
      },
      {
        src: path.join(__dirname, '../templates/project/tsconfig.json'),
        dest: path.join(process.cwd(), 'tsconfig.json'),
        name: 'tsconfig.json'
      },
      {
        src: path.join(__dirname, '../templates/project/package.json'),
        dest: path.join(process.cwd(), 'package.json'),
        name: 'package.json'
      },
      {
        src: path.join(__dirname, '../templates/project/.gitignore'),
        dest: path.join(process.cwd(), '.gitignore'),
        name: '.gitignore'
      }
    ];

    // Copy each file, asking for confirmation if it already exists
    for (const file of filesToCopy) {
      // Check if source file exists
      if (!(await fileExists(file.src))) {
        console.log(`Template file ${file.name} not found, skipping`);
        continue;
      }
      
      if (await fileExists(file.dest)) {
        const shouldOverwrite = await promptForConfirmation(
          `File ${file.name} already exists. Overwrite?`,
          false // Default to No
        );
        
        if (!shouldOverwrite) {
          console.log(`Skipping ${file.name}`);
          continue;
        }
      }
      
      await fs.copy(file.src, file.dest);
      console.log(`Created ${file.name}`);
      
      // Special handling for manifest.json to update UUIDs
      if (file.name === 'manifest.json') {
        const manifestPath = path.join(process.cwd(), 'manifest.json');
        
        // Read the manifest as JSON to properly manipulate it
        const manifestJson = await fs.readJSON(manifestPath);
        
        // Update name and description
        manifestJson.header.name = projectName;
        manifestJson.header.description = projectDescription;
        
        // Generate new UUIDs for each module
        manifestJson.header.uuid = uuidv4();
        
        // Update modules with new UUIDs
        if (manifestJson.modules && manifestJson.modules.length > 0) {
          for (const module of manifestJson.modules) {
            if (module.uuid) {
              module.uuid = uuidv4();
            }
          }
        }
        
        // Update version with the project version
        const versionParts = projectVersion.split('.').map(part => parseInt(part, 10));
        while (versionParts.length < 3) versionParts.push(0); // Ensure we have at least 3 parts
        
        manifestJson.header.version = versionParts.slice(0, 3); // Use first 3 parts
        
        // Update module versions to match the header version
        if (manifestJson.modules) {
          for (const module of manifestJson.modules) {
            if (module.version) {
              module.version = [...manifestJson.header.version];
            }
          }
        }
        
        // Update metadata
        if (manifestJson.metadata) {
          if (projectAuthor) {
            manifestJson.metadata.authors = [projectAuthor];
          }
          
          manifestJson.metadata.license = projectLicense;
          
          if (projectRepo) {
            const repoUrl = projectRepo.startsWith('http') 
              ? projectRepo 
              : `https://github.com/${projectRepo}`;
            
            manifestJson.metadata.url = repoUrl;
          }
        }
        
        // Write the updated JSON back to the file
        await fs.writeJSON(manifestPath, manifestJson, { spaces: 2 });
        
        console.log('Updated manifest.json with UUIDs and project details');
      }
      
      // Special handling for package.json to update project details
      if (file.name === 'package.json') {
        const packagePath = path.join(process.cwd(), 'package.json');
        let packageJson = await fs.readJSON(packagePath);
        
        // Update package.json with project details
        packageJson.name = projectName;
        packageJson.version = projectVersion;
        packageJson.description = projectDescription;
        packageJson.author = projectAuthor;
        packageJson.license = projectLicense;
        
        // Add repository if provided
        if (projectRepo) {
          packageJson.repository = {
            type: 'git',
            url: projectRepo.startsWith('http') ? projectRepo : `https://github.com/${projectRepo}.git`
          };
        }
        
        await fs.writeJSON(packagePath, packageJson, { spaces: 2 });
        console.log('Updated package.json with project details');
      }
    }

    // Run npm install
    console.log('Installing npm dependencies...');
    await execWithLog('npm install');

    // Install rubedo modules
    console.log('Installing rubedo modules...');
    await execWithLog('rubedo install');

    // Build the project
    console.log('Building the project...');
    await execWithLog('rubedo build');
    
    console.log('\nProject initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing project:', error);
    throw error;
  }
} 