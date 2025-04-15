import { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec);

/**
 * Executes a command and logs its output in real-time
 * @param command Command to execute
 * @param options Command options
 */
export async function execWithLog(command: string, options?: any): Promise<void> {
  console.log(`Executing: ${command}`);
  try {
    const { stdout, stderr } = await exec(command, options);
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error(stderr);
    }
  } catch (error: any) {
    // Log the error output
    if (error.stdout) {
      console.log(error.stdout);
    }
    
    if (error.stderr) {
      console.error(error.stderr);
    }
    
    throw error;
  }
} 