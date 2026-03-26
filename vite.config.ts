import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { promises as fs } from 'fs';

// Plugin to copy HTML outputs to dist root (Chrome Extension expects popup.html and sidepanel.html at root)
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
