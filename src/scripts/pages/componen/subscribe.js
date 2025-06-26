import Swal from 'sweetalert2';

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

      // --- PERBAIKAN KEDUA DI SINI ---
      // 1. Ambil hasil .toJSON() seperti sebelumnya.
      const subscriptionJSON = subscription.toJSON();

      // 2. Buat objek body baru, tapi HANYA ambil properti yang diizinkan oleh API.
      // Ini akan membuang properti "expirationTime".
      const body = {
        endpoint: subscriptionJSON.endpoint,
        keys: subscriptionJSON.keys,
      };

      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json();
      if (!response.ok || responseData.error) {
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

      if (subscription) {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire('Gagal', 'Sesi Anda berakhir. Silakan login kembali.', 'error');
          return;
        }

        const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        
        const responseData = await response.json();
        if (!response.ok || responseData.error) {
          throw new Error(responseData.message || 'Gagal unsubscribe dari server.');
        }

        await subscription.unsubscribe();

        Swal.fire('Berhasil!', 'Langganan notifikasi telah dihentikan.', 'info');
        updateButtonUI(false);
      } else {
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
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        updateButtonUI(!!subscription);
      } catch (error) {
        console.error('Error saat memeriksa subscription awal:', error);
        updateButtonUI(false);
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