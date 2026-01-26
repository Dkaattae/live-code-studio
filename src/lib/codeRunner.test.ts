import { describe, it, expect } from 'vitest';
import { executeCode } from '@/lib/codeRunner';

describe('Code Runner', () => {
  describe('executeCode', () => {
    it('should execute simple JavaScript code', async () => {
      const code = 'console.log("Hello, World!");';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toBe('Hello, World!');
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should capture multiple console.log outputs', async () => {
      const code = `
        console.log("Line 1");
        console.log("Line 2");
        console.log("Line 3");
      `;
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('Line 1');
      expect(result.output).toContain('Line 2');
      expect(result.output).toContain('Line 3');
    });

    it('should handle objects in console.log', async () => {
      const code = 'console.log({ name: "test", value: 42 });';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('name');
      expect(result.output).toContain('test');
      expect(result.output).toContain('42');
    });

    it('should handle arrays in console.log', async () => {
      const code = 'console.log([1, 2, 3]);';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('[');
      expect(result.output).toContain('1');
    });

    it('should capture syntax errors', async () => {
      const code = 'function broken( {';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).not.toBeNull();
      expect(result.output).toBe('');
    });

    it('should capture runtime errors', async () => {
      const code = 'throw new Error("Test error");';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toContain('Test error');
    });

    it('should handle undefined variable errors', async () => {
      const code = 'console.log(undefinedVariable);';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).not.toBeNull();
    });

    it('should return error for unsupported languages', async () => {
      const code = 'print("Hello")';
      const result = await executeCode(code, 'python');
      
      expect(result.error).toContain('not supported');
    });

    it('should handle console.error', async () => {
      const code = 'console.error("Error message");';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('[Error]');
      expect(result.output).toContain('Error message');
    });

    it('should handle console.warn', async () => {
      const code = 'console.warn("Warning message");';
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('[Warning]');
    });

    it('should execute TypeScript code by stripping types', async () => {
      const code = `
        const greeting: string = "Hello TypeScript";
        console.log(greeting);
      `;
      const result = await executeCode(code, 'typescript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('Hello TypeScript');
    });

    it('should handle null and undefined values', async () => {
      const code = `
        console.log(null);
        console.log(undefined);
      `;
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('null');
      expect(result.output).toContain('undefined');
    });

    it('should handle function execution', async () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
        console.log(add(2, 3));
      `;
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toBe('5');
    });

    it('should handle array methods', async () => {
      const code = `
        const numbers = [1, 2, 3, 4, 5];
        const doubled = numbers.map(n => n * 2);
        console.log(doubled);
      `;
      const result = await executeCode(code, 'javascript');
      
      expect(result.error).toBeNull();
      expect(result.output).toContain('2');
      expect(result.output).toContain('10');
    });

    it('should block fetch API', async () => {
      const code = 'console.log(typeof fetch);';
      const result = await executeCode(code, 'javascript');
      
      expect(result.output).toBe('undefined');
    });

    it('should block setTimeout', async () => {
      const code = 'console.log(typeof setTimeout);';
      const result = await executeCode(code, 'javascript');
      
      expect(result.output).toBe('undefined');
    });
  });
});
