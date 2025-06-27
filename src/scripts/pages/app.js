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
    // this.#initialServiceWorker(); // <-- Kita beri komentar dulu agar tidak macet
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

      // --- BAGIAN YANG DISESUAIKAN DENGAN DOKUMENTASI API ---
      
      // Ambil token autentikasi
      const token = localStorage.getItem('token'); // Pastikan key 'token' sudah benar
      if (!token) {
        console.error('Token autentikasi tidak ditemukan.');
        return;
      }

      console.log('Mengirim subscription ke server...');

      // Sesuai dokumentasi: Panggil endpoint subscribe
      const response = await fetch('/notifications/subscribe', {
        method: 'POST', // Sesuai dokumentasi: Method POST
        headers: {
          'Content-Type': 'application/json',     // Sesuai dokumentasi: Header Content-Type
          'Authorization': `Bearer ${token}`, // Sesuai dokumentasi: Header Authorization
        },
        body: JSON.stringify(newSubscription), // Sesuai dokumentasi: Request Body berisi objek subscription
      });
      
      const responseData = await response.json();

      // Sesuai dokumentasi: Cek respons dari server
      if (response.ok && !responseData.error) {
        console.log(responseData.message); // Akan menampilkan: "Success to subscribe web push notification."
      } else {
        // Jika server mengembalikan error, tampilkan pesannya
        console.error('Gagal subscribe ke server:', responseData.message);
        // Hapus subscription yang gagal dikirim agar bisa coba lagi nanti
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