import routes from '../routes/routes';
// Pastikan path ke url-parser benar jika Anda menggunakannya
// import { getActiveRoute } from '../routes/url-parser'; 

// Import helper function untuk VAPID key
import urlBase64ToUint8Array from '../utils/index.js'; 

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#initialServiceWorker(); // Panggil method untuk inisialisasi Service Worker
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }
    });
  }

  // Method baru untuk registrasi SW dan Push Notification
  async #initialServiceWorker() {
      if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker: Registered successfully.');
          })
          .catch(error => {
            console.error('Service Worker: Registration failed:', error);
          });
      });
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker: Registered successfully.');

      // Meminta izin notifikasi setelah SW aktif
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission was not granted.');
        return;
      }

      // Proses subscribe ke push manager
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log('User IS already subscribed.');
        return; // Hentikan jika sudah subscribe
      }


      const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('User subscribed successfully:', newSubscription);
   
      // Contoh:
      // fetch('https://your-api-endpoint.com/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(newSubscription),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
    } catch (error) {
      console.error('Service Worker: Failed to register or subscribe.', error);
    }
  }

  async renderPage() {
    // Pastikan Anda menggunakan routing yang konsisten
    const url = window.location.hash.slice(1).toLowerCase() || '/';
    const page = routes[url];
    const content = document.querySelector('#mainContent');
    
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      content.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default App;