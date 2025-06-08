import Swal from 'sweetalert2';


function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
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
      button.textContent = 'Unsubscribe';
      statusText.textContent = 'Kamu sudah berlangganan notifikasi.';
    } else {
      button.textContent = 'Subscribe Notifikasi';
      statusText.textContent = 'Kamu belum berlangganan.';
    }
  };

const subscribe = async () => {
    const registration = await navigator.serviceWorker.ready;
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log('Berhasil subscribe:', subscription);

     
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Gagal', 'Anda harus login untuk berlangganan notifikasi.', 'error');
        return;
      }
      
      
      await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription), 
      });
      
      Swal.fire('Berhasil!', 'Kamu berhasil berlangganan notifikasi!', 'success');
      updateButtonUI(true);

    } catch (err) {
      console.error('Gagal subscribe:', err);
      Swal.fire('Gagal', 'Gagal melakukan subscribe. Pastikan izin notifikasi diaktifkan.', 'error');
      updateButtonUI(false); 
    }
  };

  const unsubscribe = async () => {
    const registration = await navigator.serviceWorker.ready;
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Berhasil unsubscribe:', subscription);
       
        Swal.fire('Berhasil!', 'Langganan notifikasi telah dihentikan.', 'info');
      }
      updateButtonUI(false);
    } catch (err) {
      console.error('Gagal unsubscribe:', err);
      Swal.fire('Gagal', 'Gagal melakukan unsubscribe.', 'error');
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
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      updateButtonUI(!!subscription);
    } else {
      button.disabled = true;
      statusText.textContent = "Push notification tidak didukung di browser ini.";
    }
  };

  checkInitialSubscription();

  container.appendChild(button);
  container.appendChild(statusText);
  return container;
};

export default SubscribeButton;