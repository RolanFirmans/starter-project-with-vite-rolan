// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import Camera from "./utils/camera.js";


// --- KODE PENDAFTARAN SERVICE WORKER ---
// Cek apakah browser mendukung Service Worker
if ('serviceWorker' in navigator) {
  // Gunakan event 'load' untuk memastikan pendaftaran tidak mengganggu loading halaman utama
  window.addEventListener('load', () => {
    // Daftarkan file sw.js yang ada di root folder
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Pendaftaran Service Worker BERHASIL. Scope:', registration.scope);
      })
      .catch(error => {
        console.error('Pendaftaran Service Worker GAGAL:', error);
      });
  });
} else {
  console.log('Browser ini tidak mendukung Service Worker.');
}
// --- AKHIR KODE PENDAFTARAN ---


// Inisialisasi Aplikasi (sudah benar)
const app = new App({
  navigationDrawer: document.querySelector("#navigation-drawer"),
  drawerButton: document.querySelector("#drawer-button"),
  content: document.querySelector("#mainContent"),
});


// 1. Render halaman saat pertama kali aplikasi dimuat
window.addEventListener("load", () => {
  app.renderPage();
});

// 2. Render halaman ulang saat URL hash berubah (navigasi)
window.addEventListener("hashchange", () => {
  app.renderPage();
  Camera.stopAllStreams(); // Logika stop kamera bisa digabung di sini
});

// Kirim ulang data register yang tertunda ketika online
window.addEventListener("online", () => {
  const savedRegister = localStorage.getItem("pendingRegister");
  if (savedRegister) {
    fetch("https://story-api.dicoding.dev/v1/register", {
      method: "POST",
      body: savedRegister,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => {
        localStorage.removeItem("pendingRegister");
        console.log("Data register terkirim setelah online.");
      })
      .catch((err) => {
        console.error("Gagal kirim ulang register:", err);
      });
  }
});