import StoryModel from "../../data/story-model";
import { getStories } from "../../data/db";
import L from "leaflet";

const StoryPresenter = {
  async init(view) {
    const token = localStorage.getItem("token");
    const stories = await getStories();
    if (!token) {
      window.location.hash = "/login";
      return;
    }

    view.clearStoryList();

    try {
      const stories = await StoryModel.fetchStories(token);
      view.renderStories(stories);
      view.addStoryMarkersToMap(stories);
    } catch (error) {
      view.showError(`Gagal memuat cerita: ${error.message}`);
    }

    view.setupLogout();
  },
};

export default StoryPresenter;
