import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { promises as fs } from 'fs';

// Plugin to copy HTML outputs to dist root (Chrome Extension expects popup.html and sidepanel.html at root)
// Also removes .woff (legacy) files — Chrome Extension only needs .woff2
function chromeExtensionHtml(): Plugin {
  return {
    name: 'chrome-extension-html',
    async writeBundle(options, bundle) {
      const outDir = options.dir || 'dist';
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
      // Remove .woff (legacy) files — Chrome only needs .woff2
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
    },
  };
}

export default defineConfig({
  plugins: [react(), chromeExtensionHtml()],
  build: {
    outDir: 'dist',
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
