import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { promises as fs } from 'fs';

// Plugin to (1) copy nested HTML outputs (popup/sidepanel) to dist root,
// (2) remove .woff legacy files (Chrome only needs .woff2),
// (3) safety-net copy of public/* (manifest.json + icons/) in case
//     default publicDir copy didn't fire (observed on some Vite paths).
function chromeExtensionHtml(): Plugin {
  return {
    name: 'chrome-extension-html',
    async writeBundle(options, bundle) {
      const outDir = options.dir || 'dist';
      // (1) Hoist nested HTML to root
      for (const [fileName] of Object.entries(bundle)) {
        if (fileName.endsWith('.html') && fileName.includes('/')) {
          const baseName = fileName.split('/').pop()!;
          const src = resolve(outDir, fileName);
          const dest = resolve(outDir, baseName);
          try {
            await fs.copyFile(src, dest);
          } catch {
            // Source file doesn't exist — skip
          }
        }
      }
      // (2) Cleanup nested src/ duplicates left after hoist
      const srcDup = resolve(outDir, 'src');
      try {
        await fs.rm(srcDup, { recursive: true, force: true });
      } catch {
        // ignore
      }
      // (3) Remove .woff (legacy) — Chrome needs only .woff2
      const assetsDir = resolve(outDir, 'assets');
      try {
        const files = await fs.readdir(assetsDir);
        for (const file of files) {
          if (file.endsWith('.woff') && !file.endsWith('.woff2')) {
            await fs.unlink(resolve(assetsDir, file));
          }
        }
      } catch {
        // assets dir may not exist
      }
      // (4) Safety net: ensure public/* is in dist/ (manifest.json + icons/).
      // Default publicDir copy normally handles this, but explicit copy avoids
      // edge cases when build is run with non-standard flags / CI environments.
      const publicDir = resolve(__dirname, 'public');
      try {
        const entries = await fs.readdir(publicDir, { withFileTypes: true });
        for (const entry of entries) {
          const src = resolve(publicDir, entry.name);
          const dest = resolve(outDir, entry.name);
          await fs.cp(src, dest, { recursive: true, force: true });
        }
      } catch {
        // public dir may not exist (some test configs)
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), chromeExtensionHtml()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    copyPublicDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        sidepanel: resolve(__dirname, 'src/sidepanel/sidepanel.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
