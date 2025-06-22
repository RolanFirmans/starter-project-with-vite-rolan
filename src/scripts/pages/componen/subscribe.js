import Swal from 'sweetalert2';

// Fungsi ini sudah benar, tidak perlu diubah.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const SubscribeButton = () => {
  const container = document.createElement('div');
  const button = document.createElement('button');
  const statusText = document.createElement('p');

  button.id = 'subscribeButton';
  button.style.marginTop = '16px';
  statusText.style.fontSize = '0.9rem';
  statusText.style.marginTop = '8px';

  const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  const updateButtonUI = (isSubscribed) => {
    if (isSubscribed) {
      button.textContent = 'Unsubscribe Notifikasi';
      statusText.textContent = 'Kamu sudah berlangganan notifikasi.';
    } else {
      button.textContent = 'Subscribe Notifikasi';
      statusText.textContent = 'Kamu belum berlangganan.';
    }
  };

const subscribe = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Gagal', 'Anda harus login untuk berlangganan notifikasi.', 'error');
      return;
    }
    const body = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh')
          ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
          : null,
        auth: subscription.getKey('auth')
          ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          : null,
      },
    };

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }), // Gunakan body yang baru dibuat
    });

    const responseData = await response.json();
    if (!response.ok || responseData.error) {
      // Jika masih gagal, lempar error agar bisa ditangkap catch block
      throw new Error(responseData.message || 'Gagal mengirim subscription ke server.');
    }

    Swal.fire('Berhasil!', 'Kamu berhasil berlangganan notifikasi!', 'success');
    updateButtonUI(true);

  } catch (err) {
    console.error('Gagal subscribe:', err);
    Swal.fire('Gagal', `Gagal melakukan subscribe. ${err.message}`, 'error');
    updateButtonUI(false);
  }
};

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      // --- PERBAIKAN: Seluruh logika unsubscribe ada di sini ---
      if (subscription) {
        // 1. Ambil token di dalam scope fungsi ini
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire('Gagal', 'Sesi Anda berakhir. Silakan login kembali.', 'error');
          return;
        }

        // 2. Kirim request DELETE ke server TERLEBIH DAHULU
        const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', { // URL yang benar
          method: 'DELETE', // Method yang benar
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }), // Body yang benar
        });
        
        const responseData = await response.json();
        if (!response.ok || responseData.error) {
          throw new Error(responseData.message || 'Gagal unsubscribe dari server.');
        }

        // 3. Jika server berhasil, baru unsubscribe dari browser
        await subscription.unsubscribe();

        console.log('Berhasil unsubscribe dari browser dan server');
        Swal.fire('Berhasil!', 'Langganan notifikasi telah dihentikan.', 'info');
        updateButtonUI(false);
      } else {
        // Jika tidak ada subscription, cukup update UI
        Swal.fire('Info', 'Anda memang belum berlangganan.', 'info');
        updateButtonUI(false);
      }
    } catch (err) {
      console.error('Gagal unsubscribe:', err);
      Swal.fire('Gagal', `Gagal melakukan unsubscribe. ${err.message}`, 'error');
    }
  };

  button.addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.ready;
    const currentSubscription = await registration.pushManager.getSubscription();
    if (currentSubscription) {
      await unsubscribe();
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribe();
      } else {
        Swal.fire('Info', 'Izin notifikasi tidak diberikan.', 'warning');
      }
    }
  });

  const checkInitialSubscription = async () => {
    // ... (Fungsi ini sudah benar, tidak ada perubahan)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        updateButtonUI(!!subscription);
      } catch (error) {
        console.error('Error saat memeriksa subscription awal:', error);
        updateButtonUI(false); // Anggap tidak subscribe jika ada error
      }
    } else {
      button.disabled = true;
      statusText.textContent = 'Push notification tidak didukung di browser ini.';
    }
  };

  checkInitialSubscription();

  container.appendChild(button);
  container.appendChild(statusText);
  return container;
};

export default SubscribeButton;