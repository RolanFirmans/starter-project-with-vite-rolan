// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import Camera from "./utils/camera.js";

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

if ("serviceWorker" in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker terdaftar dengan sukses:', registration);
      })
      .catch((error) => {
        console.error('Gagal mendaftarkan Service Worker:', error);
      });
  });
}

const token = localStorage.getItem("token");

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