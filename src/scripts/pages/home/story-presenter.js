import StoryModel from "../../data/story-model";
import StoriesDb from "../../data/db-helper"; 
import L from "leaflet";

const StoryPresenter = {
  async init(view) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "/login";
      return;
    }

 
    view.clearStoryList();
    
    try {
      console.log("Mencoba mengambil cerita dari API...");
      const storiesFromApi = await StoryModel.fetchStories(token);

     
      console.log("Berhasil dari API, menyimpan ke IndexedDB...");
      await StoriesDb.putAllStories(storiesFromApi);

   
      console.log("Menampilkan cerita dari API...");
      view.renderStories(storiesFromApi);
      view.addStoryMarkersToMap(storiesFromApi);

    } catch (error) {
      
      console.error(`Gagal mengambil dari API: ${error.message}`);
      console.log("Mencoba mengambil cerita dari IndexedDB sebagai fallback...");
      
      const storiesFromDb = await StoriesDb.getAllStories();
      
   
      if (storiesFromDb && storiesFromDb.length > 0) {
        console.log("Menampilkan cerita dari IndexedDB...");
        console.log(storiesFromDb);
        view.renderStories(storiesFromDb);
        view.addStoryMarkersToMap(storiesFromDb);
      } else {
       
        console.error("Tidak ada data di IndexedDB, menampilkan pesan error.");
        view.showError("Gagal memuat cerita. Periksa koneksi internet Anda atau coba lagi nanti.");
      }
    }

    view.setupLogout();
  },
};

export default StoryPresenter;