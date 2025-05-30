const SubscribeButton = () => {
  const container = document.createElement("div");
  const button = document.createElement("button");
  const statusText = document.createElement("p");

  button.id = "subscribeButton";
  button.style.marginTop = "16px";
  statusText.style.fontSize = "0.9rem";
  statusText.style.marginTop = "8px";

  const isSubscribed = localStorage.getItem("subscribed") === "true";
  button.textContent = isSubscribed ? "Unsubscribe" : "Subscribe Notifikasi";
  statusText.textContent = isSubscribed
    ? "Kamu sudah berlangganan notifikasi."
    : "Kamu belum berlangganan.";

  button.addEventListener("click", () => {
    const currentStatus = localStorage.getItem("subscribed") === "true";

    if (currentStatus) {
      localStorage.setItem("subscribed", "false");
      button.textContent = "Subscribe Notifikasi";
      statusText.textContent = "Kamu belum berlangganan.";
      alert("Berhenti berlangganan.");
    } else {
      localStorage.setItem("subscribed", "true");
      button.textContent = "Unsubscribe";
      statusText.textContent = "Kamu sudah berlangganan notifikasi.";
      alert("Berhasil berlangganan!");
    }
    if (Notification && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Terima kasih telah berlangganan!");
        }
      });
    }
  });

  container.appendChild(button);
  container.appendChild(statusText);
  return container;
};
export default SubscribeButton;
