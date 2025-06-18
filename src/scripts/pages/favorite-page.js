// File: src/scripts/pages/favorite-page.js

import StoriesDb from '../../scripts/data/db-helper.js';
import Swal from 'sweetalert2';

const FavoritePage = {
  async render() {
    return `
      <section class="stories">
        <h2 class="content-title">Cerita Tersimpan Anda</h2>
        <div id="saved-story-list" class="story-list">
          </div>
      </section>
    `;
  },

  async afterRender() {
    // Fungsi ini akan dijalankan setelah halaman di-render
    await this._renderSavedStories();
  },

  async _renderSavedStories() {
    const container = document.querySelector('#saved-story-list');
    container.innerHTML = '<p>Memuat cerita tersimpan...</p>'; // Pesan loading

    try {
      const savedStories = await StoriesDb.getAllStories();

      if (savedStories.length === 0) {
        container.innerHTML = '<p class="empty-message">Anda belum menyimpan cerita apapun. Kembali ke Beranda untuk menyimpan cerita favoritmu!</p>';
        return;
      }

      container.innerHTML = ''; // Kosongkan container sebelum mengisi dengan kartu
      savedStories.forEach(story => {
        // Buat elemen kartu cerita
        const storyCard = this._createStoryCard(story);
        container.innerHTML += storyCard;
      });

      this._addDeleteListeners();
    } catch (error) {
      container.innerHTML = `<p class="error-message">Gagal memuat cerita tersimpan: ${error.message}</p>`;
    }
  },

  _createStoryCard(story) {
    const storyDate = new Date(story.createdAt).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <div class="story-card" tabindex="0">
        <img src="${story.photoUrl}" alt="Gambar untuk cerita ${story.name}" class="story-image">
        <div class="story-content">
          <h3 class="story-title">${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <small class="story-date">${storyDate}</small>
          <button class="delete-button-favorite" data-id="${story.id}" aria-label="Hapus cerita ${story.name} dari favorit">Hapus</button>
        </div>
      </div>
    `;
  },

  _addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button-favorite');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation(); // Mencegah event lain terpicu
        const storyId = event.target.dataset.id;
        
        const confirmResult = await Swal.fire({
            title: 'Hapus dari Favorit?',
            text: 'Cerita ini akan dihapus dari daftar tersimpan Anda.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        });

        if (confirmResult.isConfirmed) {
            await StoriesDb.deleteStory(storyId);
            Swal.fire('Dihapus!', 'Cerita telah dihapus dari daftar tersimpan.', 'success');
            // Render ulang halaman untuk menampilkan daftar cerita terbaru
            await this._renderSavedStories(); 
        }
      });
    });
  },
};

export default FavoritePage;