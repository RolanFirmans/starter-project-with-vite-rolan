import StoryPresenter from "../home/story-presenter";
import SubscribeButton from "../componen/subscribe";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Swal from "sweetalert2";
import StoriesDb from "../../data/db-helper.js"; 

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
    if (!stories || stories.length === 0) {
      container.innerHTML = "<p>Belum ada cerita. Tambahkan ceritamu!</p>";
      return;
    }

    container.innerHTML = stories

      .map((story, index) => {
        try {
          const imageUrl = story.photoUrl
            ? story.photoUrl
            : URL.createObjectURL(story.photo);

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
            <button class="delete-button" data-id="${story.id}">Hapus</button>
          </div>
        `;
        } catch (err) {
          // Sekarang 'index' sudah terdefinisi dan bisa digunakan
          console.error(`Gagal merender cerita di index ${index}:`, story);
          console.error("Error yang terjadi adalah:", err);
          return `<div class="story-card-error">Gagal memuat cerita ini. Periksa console untuk detail.</div>`;
        }
      })
      .join("");

    this.addDeleteListeners();
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

  addDeleteListeners() {
    const buttons = document.querySelectorAll(".delete-button");
    buttons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const storyId = e.target.dataset.id;
        const confirmResult = await Swal.fire({
          title: "Yakin hapus cerita ini?",
          text: "Cerita yang dihapus tidak bisa dikembalikan.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya, hapus!",
          cancelButtonText: "Batal",
        });

        if (confirmResult.isConfirmed) {
          try {
            await StoriesDb.deleteStory(storyId);

            if (navigator.onLine) {
              const token = localStorage.getItem("token");

              const response = await fetch(
                `https://story-api.dicoding.dev/v1/stories/${storyId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const result = await response.json();
              if (!response.ok) {
                console.error("Gagal hapus di API:", result.message);
              }
            }

            Swal.fire("Berhasil", "Cerita berhasil dihapus.", "success");

            await StoryPresenter.init(this);
          } catch (err) {
            Swal.fire("Gagal", `Terjadi kesalahan: ${err.message}`, "error");

            await StoryPresenter.init(this);
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
