import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// NOTE: deviates from the plan's literal port 4300. Ports 4300/4301/4777 are
// occupied by stale, unkillable dev-server processes left over from earlier
// manual verification in this sandboxed environment; reusing them via
// `reuseExistingServer` would silently test against stale/possibly-outdated
// builds instead of this task's actual code. Port 4310 was also found
// occupied at the time of writing, so 4320 (confirmed free via
// `lsof -tiTCP:4320`) is used instead to guarantee Playwright always starts a
// genuinely fresh dev server from the current working tree.
const PORT = 4320;

// NOTE: sandbox adaptation. `playwright install` cannot write into
// ~/Library/Caches/ms-playwright in this sandboxed session (EPERM on
// mkdir '__dirlock'), so the browser revision pinned by @playwright/test
// (chromium_headless_shell-1234) cannot be downloaded. A pre-existing,
// fully-validated chromium_headless_shell-1208 (from an earlier task's
// setup) is already present in the cache and works fine for this smoke
// suite, so we point launchOptions.executablePath at it when the pinned
// revision is missing. In a normal environment where `playwright install`
// succeeds, this block is a no-op (the pinned revision exists and is used).
const pinnedChromiumMissing = !existsSync(
  join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1234'),
);
const fallbackHeadlessShell = join(
  homedir(),
  'Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell',
);
const executablePath =
  pinnedChromiumMissing && existsSync(fallbackHeadlessShell) ? fallbackHeadlessShell : undefined;

// NOTE: sandbox adaptation. Chromium's default multi-process architecture
// relies on a mach port rendezvous IPC call
// (`bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer`)
// that this sandboxed session's OS-level sandbox denies with
// "Permission denied (1100)", killing the browser immediately after launch.
// `--single-process` avoids that IPC path entirely and lets Chromium run
// headlessly inside this sandbox. Harmless outside the sandbox too.
const sandboxLaunchArgs = executablePath ? ['--single-process'] : [];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry' },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath, args: sandboxLaunchArgs } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions: { executablePath, args: sandboxLaunchArgs } },
    },
  ],
  webServer: {
    command: 'pnpm start:e2e',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
