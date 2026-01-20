import { execSync } from 'node:child_process';
import path from 'node:path';

// This script ignores any arguments passed to it (like file paths from lint-staged)
// and simply runs `cargo fmt --all` in the src-tauri directory.
// This avoids path resolution issues when mixing `cd` and relative paths.

const tauriDir = path.join(process.cwd(), 'src-tauri');

console.log('Running cargo fmt --all in', tauriDir);

try {
  execSync('cargo fmt --all', { cwd: tauriDir, stdio: 'inherit' });
} catch (error) {
  console.error('cargo fmt failed');
  process.exit(1);
}
