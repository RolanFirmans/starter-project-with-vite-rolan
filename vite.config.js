// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://story-api.dicoding.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    // Properti 'outDir' mendefinisikan direktori output untuk build.
    // Default-nya adalah 'dist', jadi jika Anda sudah menggunakan 'dist', ini bisa dihilangkan.
    outDir: 'dist',
    
    // Properti 'assetsDir' mendefinisikan subdirektori untuk aset yang di-generate (JS, CSS, gambar yang diimpor).
    // Default-nya adalah 'assets'. Jika aset Anda sudah ada di 'dist/assets', ini juga bisa dihilangkan.
    assetsDir: 'assets',

    // sourcemap: true, // Opsional: Aktifkan sourcemaps untuk debugging produksi (nonaktifkan untuk mengurangi ukuran)
  },
  // 'publicDir' adalah direktori untuk file statis yang akan disalin langsung ke root 'outDir' (dist).
  // Default-nya adalah 'public'. Pastikan semua aset yang tidak diimpor langsung
  // oleh JS/CSS (seperti marker Leaflet, manifest.json, sw.js jika tidak di-inject)
  // ditempatkan di folder 'public' di root proyek Anda.
  // Contoh: YourProjectRoot/public/marker-icon.png
  //          YourProjectRoot/public/marker-shadow.png
  //          YourProjectRoot/public/sw.js
  //          YourProjectRoot/public/manifest.json
  //          YourProjectRoot/public/icons/... (jika Anda tidak mengimpor ikon di JS/CSS)
  publicDir: 'public', 
});