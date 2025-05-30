import StoryPresenter from "../home/story-presenter";
import SubscribeButton from "../componen/subscribe";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Swal from "sweetalert2";
import { deleteStory as deleteFromDB, getAllStories } from "../../data/db.js";

const HomePage = {
  map: null,

  async render() {
    return `
      <section class="stories">
        <h2>Daftar Cerita</h2>
        <a href="#/add"><button id="addStoryButton">+ Tambah Cerita</button></a>
        <div id="storyList">Memuat cerita...</div>
        <div id="map" style="height: 400px; margin-top: 16px;"></div>
        <button id="logoutButton" style="margin-top: 16px;">Logout</button>
      </section>
    `;
  },

  async afterRender() {
    this.initMap();
    await StoryPresenter.init(this);

    const subscribeContainer = document.createElement("div");
    const button = SubscribeButton();
    subscribeContainer.appendChild(button);
    document.querySelector(".stories").appendChild(subscribeContainer);

    this.setupLogout();
  },

  initMap() {
    this.map = L.map("map").setView([-6.2, 106.8], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);
  },

  clearStoryList() {
    document.querySelector("#storyList").innerHTML = "";
  },

  renderStories(stories) {
    const container = document.querySelector("#storyList");
    container.innerHTML = stories
      .map(
        (story) => `
      <div class="story-card" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="${story.name}" width="100%" />
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <small>${story.createdAt}</small>
        <button class="delete-button" data-id="${story.id}">Hapus</button>
      </div>
    `
      )
      .join("");
    this.addDeleteListeners();
  },

  addStoryMarkersToMap(stories) {
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(
          `<strong>${story.name}</strong><br>${story.description}`
        );
      }
    });
  },

  addDeleteListeners() {
    const buttons = document.querySelectorAll(".delete-button");
    buttons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const storyId = e.target.dataset.id;

        const confirm = await Swal.fire({
          title: "Yakin hapus cerita ini?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya, hapus!",
          cancelButtonText: "Batal",
        });

        if (confirm.isConfirmed) {
          try {
            const token = localStorage.getItem("token");

            const response = await fetch(`/api/v1/stories/${storyId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const result = await response.json();
            console.log("DELETE response:", result);
            if (!response.ok) throw new Error(result.message);

            await deleteFromDB(storyId);

            Swal.fire("Berhasil", "Cerita berhasil dihapus", "success");

            // Refresh tampilan
            await StoryPresenter.init(this);
          } catch (err) {
            Swal.fire("Gagal", err.message, "error");
          }
        }
      });
    });
  },

  showError(message) {
    const container = document.querySelector("#storyList");
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
