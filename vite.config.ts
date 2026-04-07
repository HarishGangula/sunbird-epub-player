import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/sunbird-epub-player.ts',
      formats: ['es', 'umd'],
      name: 'SunbirdEpubPlayer',
      fileName: (format) => `sunbird-epub-player.${format}.js`
    },
    rollupOptions: {
      external: ['lit', 'epubjs', '@project-sunbird/telemetry-sdk']
    }
  }
});
