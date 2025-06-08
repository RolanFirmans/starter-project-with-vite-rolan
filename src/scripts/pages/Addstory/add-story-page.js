import AddPresenter from "../../pages/Addstory/add-persenter.js";

const AddPage = {
  async render() {
    return `
      <section>
        <h2>Tambahkan Cerita</h2>
        <form id="addStoryForm">
          <label for="name">Nama:</label><br />
          <input type="text" id="name" name="name" required /><br /><br />

          <label for="description">Deskripsi:</label><br />
          <textarea id="description" name="description" required></textarea><br /><br />

          <label>Ambil Gambar (kamera):</label><br />
          <video id="video" autoplay playsinline width="300" height="225"></video><br />
          <button type="button" id="capture">Ambil Foto</button>
          <canvas id="canvas" style="display:none;"></canvas>
          <img id="preview" style="display:none;" /><br /><br />

          <label>Ambil Lokasi:</label>
          <div id="map" style="height:300px;"></div><br />

          <input type="hidden" id="lat" />
          <input type="hidden" id="lon" />
          <button type="submit">Kirim</button>
        </form>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new AddPresenter({
      videoEl: document.querySelector("#video"),
      canvasEl: document.querySelector("#canvas"),
      previewEl: document.querySelector("#preview"),
      formEl: document.querySelector("#addStoryForm"),
      mapEl: document.querySelector("#map"),
    });

    await presenter.initCamera();
    presenter.initMap();

    document.querySelector("#capture").addEventListener("click", () => {
      presenter.capturePhoto();
    });

    document.querySelector("#addStoryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      presenter.submitForm();
    });
  },
};

export default AddPage;
