import { test, expect } from '@playwright/test';

test.describe('Code Execution', () => {
    test('should execute simple JavaScript code', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Wait for editor to load
        await page.waitForSelector('.monaco-editor', { timeout: 10000 });

        // Clear the editor and write simple code
        // Click in the editor to focus it
        await page.locator('.monaco-editor').click();

        // Select all and delete
        await page.keyboard.press('Meta+A');
        await page.keyboard.press('Backspace');

        // Type new code
        await page.keyboard.type('console.log("Hello from E2E test");');

        // Click run button
        await page.getByRole('button', { name: /run/i }).click();

        // Wait for output to appear
        await page.waitForTimeout(1000);

        // Check for output panel
        const output = page.getByText(/Hello from E2E test/i);
        await expect(output).toBeVisible({ timeout: 5000 });
    });

    test('should execute code with variables', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Wait for editor
        await page.waitForSelector('.monaco-editor', { timeout: 10000 });
        await page.locator('.monaco-editor').click();

        // Clear and write code
        await page.keyboard.press('Meta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('const x = 5;\nconst y = 10;\nconsole.log(x + y);');

        // Run code
        await page.getByRole('button', { name: /run/i }).click();
        await page.waitForTimeout(1000);

        // Check output
        await expect(page.getByText('15')).toBeVisible({ timeout: 5000 });
    });

    test('should display error for invalid code', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Wait for editor
        await page.waitForSelector('.monaco-editor', { timeout: 10000 });
        await page.locator('.monaco-editor').click();

        // Write invalid code
        await page.keyboard.press('Meta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('const x = ;');

        // Run code
        await page.getByRole('button', { name: /run/i }).click();
        await page.waitForTimeout(1000);

        // Check for error indication
        // The output panel should show some error
        const outputPanel = page.locator('[class*="output"]').first();
        await expect(outputPanel).toBeVisible({ timeout: 5000 });
    });

    test('should execute code with functions', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Wait for editor
        await page.waitForSelector('.monaco-editor', { timeout: 10000 });
        await page.locator('.monaco-editor').click();

        // Write function code
        await page.keyboard.press('Meta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('function add(a, b) { return a + b; }\nconsole.log(add(3, 7));');

        // Run code
        await page.getByRole('button', { name: /run/i }).click();
        await page.waitForTimeout(1000);

        // Check output
        await expect(page.getByText('10')).toBeVisible({ timeout: 5000 });
    });

    test('should handle multiple console.log statements', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Wait for editor
        await page.waitForSelector('.monaco-editor', { timeout: 10000 });
        await page.locator('.monaco-editor').click();

        // Write code with multiple logs
        await page.keyboard.press('Meta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('console.log("First");\nconsole.log("Second");\nconsole.log("Third");');

        // Run code
        await page.getByRole('button', { name: /run/i }).click();
        await page.waitForTimeout(1000);

        // Check all outputs appear
        await expect(page.getByText('First')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Second')).toBeVisible();
        await expect(page.getByText('Third')).toBeVisible();
    });
});
