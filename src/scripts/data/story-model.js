import { getStories } from "./api";

const StoryModel = {
  async fetchStories(token) {
    return await getStories(token);
  },
};

export default StoryModel;
