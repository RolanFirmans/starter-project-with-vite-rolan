import SubscribeButton from "../componen/subscribe.js";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import StoryPresenter from '../../pages/home/story-presenter.js';

const HomePage = {
  map: null,

  async render() {
    return `
      <section class="stories">
        <h2>Daftar Cerita</h2>
        <a href="#/add"><button id="addStoryButton">+ Tambah Cerita</button></a>
        <div id="story-list" class="story-list"></div>
        <div id="map" style="height: 400px; margin-top: 16px;"></div>
        <button id="logoutButton" style="margin-top: 16px;">Logout</button>
        
        <div id="subscribe-container"></div> 

      </section>
    `;
  },

  async afterRender() {
    this.initMap();

    // === PERBAIKAN 3: Melindungi proses pengambilan data ===
    try {
      await StoryPresenter.init(this); // StoryPresenter yang akan handle fetch dan render
    } catch (error) {
      console.error("Gagal menginisialisasi stories (mungkin karena belum login), tapi aplikasi tetap lanjut:", error);
      // Anda bisa menampilkan pesan error di UI jika mau
      this.showError("Gagal memuat cerita. Silakan login terlebih dahulu.");
    }
    
    // === PERBAIKAN 2: Menggunakan querySelector dan memperbaiki typo ===
    const subscribeContainer = document.querySelector('#subscribe-container');
    if (subscribeContainer) {
      const subscribeButtonComponent = SubscribeButton();
      subscribeContainer.appendChild(subscribeButtonComponent);
    }
  },

  initMap() {
    this.map = L.map("map").setView([-6.2, 106.8], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);
  },

  clearStoryList() {
    document.querySelector("#story-list").innerHTML = "";
  },

  renderStories(stories) {
    const container = document.querySelector("#story-list");
    if (!stories || stories.length === 0) {
      // Jika tidak ada cerita (mungkin karena belum login), jangan tampilkan apa-apa atau beri pesan
      if (!localStorage.getItem('token')) return; // Jangan tampilkan "Belum ada cerita" jika belum login
      container.innerHTML = "<p>Belum ada cerita. Tambahkan ceritamu!</p>";
      return;
    }

    container.innerHTML = stories
      .map((story) => {
          const imageUrl = story.photoUrl || "https://via.placeholder.com/300"; // Fallback image
          const storyDate = new Date(story.createdAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          });
          return `
            <div class="story-card" data-id="${story.id}">
              <img src="${imageUrl}" alt="${story.name || "Story Image"}" style="width:100%; object-fit: cover;" />
              <p>${story.description}</p>
              <small>${storyDate}</small>
              <button class="save-button" aria-label="Simpan cerita ${story.name}" data-id="${story.id}">Simpan</button>
            </div>
          `;
      })
      .join("");
  },

  addStoryMarkersToMap(stories) {
    if (!stories) return;
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`<strong>${story.name || "Tanpa Nama"}</strong><br>${story.description}`);
      }
    });
  },

  showError(message) {
    const container = document.querySelector("#story-list");
    container.innerHTML = `<p style="color:red; text-align:center;">${message}</p>`;
  },

  setupLogout() {
    const logoutButton = document.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.hash = "/login";
        window.location.reload();
      });
    }
  },
};

export default HomePage;