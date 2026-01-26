export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
}

/**
 * Safely execute JavaScript/TypeScript code in a sandboxed environment
 */
export async function executeCode(code: string, language: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  
  // Only JavaScript/TypeScript can be executed in browser
  if (!['javascript', 'typescript'].includes(language)) {
    return {
      output: '',
      error: `Browser execution not supported for ${language}. Only JavaScript/TypeScript can be run in the browser.`,
      executionTime: 0,
    };
  }

  try {
    // Create a sandboxed environment
    const logs: string[] = [];
    
    // Override console.log to capture output
    const sandboxConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map(formatOutput).join(' '));
      },
      error: (...args: unknown[]) => {
        logs.push(`[Error] ${args.map(formatOutput).join(' ')}`);
      },
      warn: (...args: unknown[]) => {
        logs.push(`[Warning] ${args.map(formatOutput).join(' ')}`);
      },
      info: (...args: unknown[]) => {
        logs.push(args.map(formatOutput).join(' '));
      },
    };

    // For TypeScript, we strip type annotations for execution
    const executableCode = language === 'typescript' ? stripTypeAnnotations(code) : code;

    // Create a sandboxed function
    const sandboxedFunction = new Function(
      'console',
      'setTimeout',
      'setInterval',
      'fetch',
      'XMLHttpRequest',
      `
        "use strict";
        ${executableCode}
      `
    );

    // Execute with timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout (5s limit)')), 5000);
    });

    const executionPromise = new Promise<void>((resolve) => {
      sandboxedFunction(
        sandboxConsole,
        undefined, // Disabled setTimeout
        undefined, // Disabled setInterval
        undefined, // Disabled fetch
        undefined  // Disabled XMLHttpRequest
      );
      resolve();
    });

    await Promise.race([executionPromise, timeoutPromise]);

    const executionTime = performance.now() - startTime;

    return {
      output: logs.join('\n'),
      error: null,
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
    };
  }
}

function formatOutput(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * Basic TypeScript to JavaScript conversion (strips type annotations)
 */
function stripTypeAnnotations(code: string): string {
  // Remove type annotations after colons (simple cases)
  let result = code
    // Remove interface/type declarations
    .replace(/^(interface|type)\s+\w+\s*[^}]*{[^}]*}/gm, '')
    // Remove : Type annotations
    .replace(/:\s*\w+(\[\])?(\s*\|?\s*\w+(\[\])?)*(?=\s*[=,)\]}])/g, '')
    // Remove <T> generic parameters
    .replace(/<\w+(\s*,\s*\w+)*>/g, '')
    // Remove as Type assertions
    .replace(/\s+as\s+\w+(\[\])?/g, '')
    // Remove type imports
    .replace(/import\s+type\s+{[^}]*}\s+from\s+['"][^'"]+['"];?\n?/g, '');
  
  return result;
}
