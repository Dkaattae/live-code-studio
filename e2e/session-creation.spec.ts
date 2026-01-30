import { test, expect } from '@playwright/test';

test.describe('Session Creation Flow', () => {
    test('should navigate to landing page and display content', async ({ page }) => {
        await page.goto('/');

        // Check for main heading
        await expect(page.getByText('CodeInterview')).toBeVisible();

        // Check for feature descriptions
        await expect(page.getByText(/coding interviews/i)).toBeVisible();
    });

    test('should display all feature cards', async ({ page }) => {
        await page.goto('/');

        // Check for all four feature cards
        await expect(page.getByText('Real-time Collaboration')).toBeVisible();
        await expect(page.getByText('Multi-language Support')).toBeVisible();
        await expect(page.getByText('Live Execution')).toBeVisible();
        await expect(page.getByText('Easy Sharing')).toBeVisible();
    });

    test('should create session and navigate to session page', async ({ page }) => {
        await page.goto('/');

        // Click the "Start Interview" button
        const startButton = page.getByRole('button', { name: /start interview/i });
        await expect(startButton).toBeVisible();
        await startButton.click();

        // Wait for navigation to session page
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Verify we're on a session page
        expect(page.url()).toMatch(/\/session\/[a-f0-9-]{36}/);
    });

    test('should load code editor on session page', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Wait for Monaco editor to load
        // Monaco editor uses a specific class name
        await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    });

    test('should display default code template', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Wait for editor to load
        await page.waitForSelector('.monaco-editor', { timeout: 10000 });

        // Check that some default code is present
        const editorContent = await page.locator('.monaco-editor').textContent();
        expect(editorContent).toContain('Welcome to the coding interview');
    });

    test('should show language selector', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Check for language selector
        await expect(page.getByRole('combobox')).toBeVisible();
    });

    test('should show run button', async ({ page }) => {
        await page.goto('/');

        // Create a session
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        // Check for run button
        await expect(page.getByRole('button', { name: /run/i })).toBeVisible();
    });

    test('should be able to access session directly via URL', async ({ page }) => {
        // First create a session
        await page.goto('/');
        await page.getByRole('button', { name: /start interview/i }).click();
        await page.waitForURL(/\/session\/[a-f0-9-]+/);

        const sessionUrl = page.url();
        const sessionId = sessionUrl.match(/\/session\/([a-f0-9-]+)/)?.[1];

        expect(sessionId).toBeDefined();

        // Navigate away
        await page.goto('/');

        // Navigate back to the session using the URL
        await page.goto(`/session/${sessionId}`);

        // Verify we're back on the session page
        await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    });
});
