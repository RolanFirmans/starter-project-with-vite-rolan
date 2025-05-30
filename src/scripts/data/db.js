import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

export const addStory = async (story) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, story);
};

export const getAllStories = async () => {
  const db = await dbPromise;
  return await db.getAll(STORE_NAME);
};

export const deleteStory = async (id) => {
  const db = await dbPromise;
  return await db.delete(STORE_NAME, id);
};

export async function getStories() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("Token tidak ditemukan, mencoba load offline...");
    return await getAllStories(); // Ambil dari IndexedDB
  }

  try {
    const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    // Simpan ke IndexedDB
    result.listStory.forEach((story) => addStory(story));

    return result.listStory;
  } catch (err) {
    console.error("Gagal fetch dari API, ambil dari cache:", err.message);
    return await getAllStories();
  }
}

