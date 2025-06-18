import SubscribeButton from "../componen/subscribe";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Swal from "sweetalert2"; 
import StoriesDb from "../../data/db-helper.js";
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
      </section>
    `;
  },

  async afterRender() {
    this.initMap();
    await StoryPresenter.init(this); // StoryPresenter yang akan handle fetch dan render

    const subscribeContainer = document.createElement("div");
    const button = SubscribeButton();
    subscribeContainer.appendChild(button);
    document.querySelector(".stories").appendChild(subscribeContainer);

    this.setupLogout();
    // this.addSaveListeners(); // HAPUS BARIS INI
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
      container.innerHTML = "<p>Belum ada cerita. Tambahkan ceritamu!</p>";
      return;
    }

    container.innerHTML = stories
      .map((story, index) => {
        try {
          const imageUrl = story.photoUrl
            ? story.photoUrl
            : URL.createObjectURL(story.photo); // Hati-hati dengan blob URL jika story.photo bukan File

          const storyDate = new Date(story.createdAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return `
            <div class="story-card" data-id="${story.id}">
              <img src="${imageUrl}" alt="${
                story.name || "Story Image"
              }" style="width:100%; object-fit: cover;" />
              <h3>${story.name || "Tanpa Nama"}</h3>
              <p>${story.description}</p>
              <small>${storyDate}</small>
              <button class="save-button" aria-label="Simpan cerita ${story.name}" data-id="${story.id}">Simpan</button>
            </div>
          `;
        } catch (err) {
          console.error(`Gagal merender cerita di index ${index}:`, story);
          console.error("Error yang terjadi adalah:", err);
          return `<div class="story-card-error">Gagal memuat cerita ini. Periksa console untuk detail.</div>`;
        }
      })
      .join("");

  
  },

  addStoryMarkersToMap(stories) {
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(
          `<strong>${story.name || "Tanpa Nama"}</strong><br>${
            story.description
          }`
        );
      }
    });
  },

 
  showError(message) {
    const container = document.querySelector("#story-list");
    container.innerHTML = `<p style="color:red;">${message}</p>`;
  },

  setupLogout() {
    document.querySelector("#logoutButton").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.hash = "/login";
    });
  },
};

export default HomePage;