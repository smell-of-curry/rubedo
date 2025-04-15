import readline from 'readline';

/**
 * Prompts the user for confirmation
 * @param message The message to display to the user
 * @param defaultYes Whether the default answer is yes (true) or no (false)
 * @returns A promise that resolves to true if the user confirms, false otherwise
 */
export async function promptForConfirmation(
  message: string,
  defaultYes: boolean = true
): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const defaultChoice = defaultYes ? 'Y/n' : 'y/N';
  
  return new Promise((resolve) => {
    rl.question(`${message} [${defaultChoice}]: `, (answer) => {
      rl.close();
      
      // If no answer is provided, return the default
      if (!answer.trim()) {
        return resolve(defaultYes);
      }
      
      // Check the first character of the answer
      const lowered = answer.trim().toLowerCase();
      if (lowered.startsWith('y')) {
        return resolve(true);
      } else if (lowered.startsWith('n')) {
        return resolve(false);
      } else {
        // If the answer is not recognized, return the default
        return resolve(defaultYes);
      }
    });
  });
}

/**
 * Prompts the user for text input
 * @param message The message to display to the user
 * @param defaultValue The default value to use if the user doesn't provide input
 * @returns A promise that resolves to the user's input
 */
export async function promptForText(
  message: string,
  defaultValue: string = ''
): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const promptMessage = defaultValue 
    ? `${message} (${defaultValue}): ` 
    : `${message}: `;

  return new Promise((resolve) => {
    rl.question(promptMessage, (answer) => {
      rl.close();
      
      // If no answer is provided, return the default
      if (!answer.trim()) {
        return resolve(defaultValue);
      }
      
      return resolve(answer.trim());
    });
  });
} 