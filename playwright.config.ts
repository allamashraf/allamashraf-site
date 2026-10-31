import { defineConfig, devices } from '@playwright/test';

const BASE = 'http://127.0.0.1:4400';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // Firefox needs ~10s per page under full parallel load on Windows; 30s default was flaky.
  timeout: 60_000,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/test-server.mjs',
    url: `${BASE}/`,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
  },
  projects: [
    // Full matrix (axe, overflow, content, keyboard, contact) on Chromium.
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /modes\.spec/ },
    // Smoke on the other engines.
    // Firefox: smoke + the motion scene (it has no CSS scroll timelines, so GSAP must carry it).
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /routes\.spec|motion\.spec/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testMatch: /routes\.spec/ },
    // Fallback runs (§8.4).
    { name: 'no-js', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false }, testMatch: /modes\.spec/, grep: /@nojs/ },
    {
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], contextOptions: { reducedMotion: 'reduce' } },
      testMatch: /modes\.spec/,
      grep: /@reduced/,
    },
  ],
});
