// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import Camera from "./utils/camera.js";
import { registerServiceWorker } from "./utils/index.js";

const app = new App({
  navigationDrawer: document.querySelector("#navigation-drawer"),
  drawerButton: document.querySelector("#drawer-button"),
  content: document.querySelector("#mainContent"),
});

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
  // Redirect kalau belum login
  if (!token && location.hash !== "#/login") {
    location.hash = "#/login";
  } else {
    await app.renderPage();
  }

  // Register service worker hanya sekali di sini
  await registerServiceWorker();
});

// Tangani perubahan hash (pindah halaman)
window.addEventListener("hashchange", async () => {
  await app.renderPage();

  // Saat berpindah halaman, hentikan semua stream kamera
  Camera.stopAllStreams();
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
