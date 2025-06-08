import L from "leaflet";
import Swal from "sweetalert2";
import Camera from "../../utils/camera.js";
import StoriesDb from "../../data/db-helper.js";

class AddPresenter {
  constructor({ videoEl, canvasEl, previewEl, formEl, mapEl }) {
    this.videoEl = videoEl;
    this.canvasEl = canvasEl;
    this.previewEl = previewEl;
    this.formEl = formEl;
    this.mapEl = mapEl;
    this.marker = null;
    this.capturedBlob = null;
    this.map = null;
  }

  async initCamera() {
    try {
      await Camera.init(this.videoEl);
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  }

  capturePhoto() {
    const ctx = this.canvasEl.getContext("2d");
    this.canvasEl.width = this.videoEl.videoWidth;
    this.canvasEl.height = this.videoEl.videoHeight;
    ctx.drawImage(
      this.videoEl,
      0,
      0,
      this.canvasEl.width,
      this.canvasEl.height
    );

    this.canvasEl.toBlob((blob) => {
      if (blob) {
        this.capturedBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        this.previewEl.src = imageUrl;
        this.previewEl.style.display = "block";
      }
    }, "image/jpeg");
  }

  initMap() {
    if (this.map) this.map.remove();

    this.map = L.map(this.mapEl).setView([-6.2, 106.8], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      document.querySelector("#lat").value = lat;
      document.querySelector("#lon").value = lng;

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }
    });
  }

  async submitForm() {
    const name = document.querySelector("#name").value.trim();
    const description = document.querySelector("#description").value.trim();
    const lat = document.querySelector("#lat").value;
    const lon = document.querySelector("#lon").value;

    if (!this.capturedBlob) {
      Swal.fire("Peringatan", "Silakan ambil foto terlebih dahulu!", "warning");
      return;
    }

    const storyData = {
      id: `story-${Date.now()}`,
      name,
      description,
      photo: this.capturedBlob,
      lat,
      lon,
      createdAt: new Date().toISOString(),
    };

    try {
      await StoriesDb.putStory(storyData);
      console.log("Cerita berhasil disimpan ke IndexedDB.");

      if (!navigator.onLine) {
        Swal.fire(
          "Offline",
          "Cerita disimpan secara lokal. Akan disinkronkan saat kembali online.",
          "info"
        );

        this._redirectHome();
        return;
      }

      console.log("Online, mencoba mengirim cerita ke API...");
      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", this.capturedBlob, `${storyData.id}.jpg`);
      if (lat && lon) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/stories",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      Swal.fire("Berhasil!", "Cerita berhasil ditambahkan!", "success");
      this._redirectHome();
    } catch (err) {
      console.error("Gagal mengirim atau menyimpan cerita:", err);
      Swal.fire("Gagal", err.message, "error");
    }
  }

  _redirectHome() {
    Camera.stopAllStreams();
    window.location.hash = "/";
  }
}

export default AddPresenter;
