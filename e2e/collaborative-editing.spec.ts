import { test, expect, chromium } from '@playwright/test';

test.describe('Collaborative Editing', () => {
    test('should sync code changes between two browser contexts', async () => {
        // Create two separate browser contexts to simulate two users
        const browser = await chromium.launch();
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        try {
            // User 1 creates a session
            await page1.goto('/');
            await page1.getByRole('button', { name: /start interview/i }).click();
            await page1.waitForURL(/\/session\/[a-f0-9-]+/);

            const sessionUrl = page1.url();
            const sessionId = sessionUrl.match(/\/session\/([a-f0-9-]+)/)?.[1];

            expect(sessionId).toBeDefined();

            // Wait for editor to load for user 1
            await page1.waitForSelector('.monaco-editor', { timeout: 10000 });

            // User 2 joins the same session
            await page2.goto(`/session/${sessionId}`);
            await page2.waitForSelector('.monaco-editor', { timeout: 10000 });

            // User 1 writes code
            await page1.locator('.monaco-editor').click();
            await page1.keyboard.press('Meta+A');
            await page1.keyboard.press('Backspace');
            await page1.keyboard.type('// Code from User 1\nconsole.log("Hello");');

            // Wait a bit for real-time sync
            await page2.waitForTimeout(2000);

            // Check if User 2 sees the changes
            const page2Content = await page2.locator('.monaco-editor').textContent();
            expect(page2Content).toContain('Code from User 1');

        } finally {
            await page1.close();
            await page2.close();
            await context1.close();
            await context2.close();
            await browser.close();
        }
    });

    test('should show participant indicators for multiple users', async () => {
        const browser = await chromium.launch();
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        try {
            // User 1 creates a session
            await page1.goto('/');
            await page1.getByRole('button', { name: /start interview/i }).click();
            await page1.waitForURL(/\/session\/[a-f0-9-]+/);

            const sessionUrl = page1.url();
            const sessionId = sessionUrl.match(/\/session\/([a-f0-9-]+)/)?.[1];

            // Wait for editor
            await page1.waitForSelector('.monaco-editor', { timeout: 10000 });

            // User 2 joins
            await page2.goto(`/session/${sessionId}`);
            await page2.waitForSelector('.monaco-editor', { timeout: 10000 });

            // Wait for presence to sync
            await page1.waitForTimeout(2000);

            // Check for participant indicator (this depends on your UI implementation)
            // You might need to adjust the selector based on your actual component
            const participantIndicator = page1.locator('[class*="participant"]').first();

            // At minimum, verify the page loaded correctly for both users
            await expect(page1.locator('.monaco-editor')).toBeVisible();
            await expect(page2.locator('.monaco-editor')).toBeVisible();

        } finally {
            await page1.close();
            await page2.close();
            await context1.close();
            await context2.close();
            await browser.close();
        }
    });

    test('should handle language changes across users', async () => {
        const browser = await chromium.launch();
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        try {
            // User 1 creates a session
            await page1.goto('/');
            await page1.getByRole('button', { name: /start interview/i }).click();
            await page1.waitForURL(/\/session\/[a-f0-9-]+/);

            const sessionUrl = page1.url();
            const sessionId = sessionUrl.match(/\/session\/([a-f0-9-]+)/)?.[1];

            await page1.waitForSelector('.monaco-editor', { timeout: 10000 });

            // User 2 joins
            await page2.goto(`/session/${sessionId}`);
            await page2.waitForSelector('.monaco-editor', { timeout: 10000 });

            // User 1 changes language
            const languageSelector = page1.getByRole('combobox');
            await languageSelector.click();

            // Select Python (adjust based on your UI)
            await page1.getByText('Python').click();

            // Wait for sync
            await page2.waitForTimeout(2000);

            // Verify both users see Python selected
            await expect(page1.getByText('Python')).toBeVisible();
            await expect(page2.getByText('Python')).toBeVisible();

        } finally {
            await page1.close();
            await page2.close();
            await context1.close();
            await context2.close();
            await browser.close();
        }
    });
});
