import "../styles/styles.css";

import App from "./pages/app";
import Camera from "./utils/camera.js";


if ('serviceWorker' in navigator) {
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


const app = new App({
  navigationDrawer: document.querySelector("#navigation-drawer"),
  drawerButton: document.querySelector("#drawer-button"),
  content: document.querySelector("#mainContent"),
});


window.addEventListener("load", () => {
  app.renderPage();
});

window.addEventListener("hashchange", () => {
  app.renderPage();
  Camera.stopAllStreams(); 
});

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