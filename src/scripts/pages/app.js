import routes from '../routes/routes';
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

  async #initialServiceWorker() {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Service Worker atau Push Messaging tidak didukung browser ini.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Izin notifikasi tidak diberikan.');
        return;
      }

      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('User SUDAH subscribe.');
        return;
      }

      // Sesuai dokumentasi: VAPID public key
      const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('Berhasil mendapatkan subscription baru:', newSubscription);

      
      // Ambil token autentikasi
      const token = localStorage.getItem('token'); 
      if (!token) {
        console.error('Token autentikasi tidak ditemukan.');
        return;
      }

      console.log('Mengirim subscription ke server...');

      const response = await fetch('/notifications/subscribe', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',   
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(newSubscription), 
      });
      
      const responseData = await response.json();

      if (response.ok && !responseData.error) {
        console.log(responseData.message); 
      } else {
        console.error('Gagal subscribe ke server:', responseData.message);
        await newSubscription.unsubscribe(); 
      }
      
    } catch (error) {
      console.error('Operasi Service Worker atau subscribe gagal:', error);
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