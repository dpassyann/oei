// Mirrors the versioned, multilingual `content/` corpus at the repo root into
// `public/assets/content` so it ships as plain static assets picked up by the
// existing `public` asset glob in angular.json — no symlink (works identically
// on Windows/macOS/Linux, and plays nicely with git worktrees).
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, '..', '..', '..', 'content');
const destination = path.resolve(here, '..', 'public', 'assets', 'content');

if (!existsSync(source)) {
  console.warn(`[copy-content-assets] source not found, skipping: ${source}`);
  process.exit(0);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
console.log(`[copy-content-assets] copied ${source} -> ${destination}`);
