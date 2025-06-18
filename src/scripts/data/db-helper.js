import { openDB } from 'idb';
 
const DB_NAME = 'story-app-db';
const STORE_NAME = 'stories';
const DB_VERSION = 1;
 
// Promise untuk membuka database
const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Buat object store jika belum ada
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});
 
// Object helper untuk operasi CRUD ke IndexedDB
const StoriesDb = {
  /**
   * Mengambil satu cerita berdasarkan ID.
   * @param {string} id - ID cerita.
   */
  async getStory(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },
 
  /**
   * Mengambil semua cerita dari database.
   */
  async getAllStories() {
    return (await dbPromise).getAll(STORE_NAME);
  },
 
  /**
   * Menambah atau memperbarui satu cerita.
   * @param {object} story - Objek cerita.
   */
  async putStory(story) {
    return (await dbPromise).put(STORE_NAME, story);
  },
  
  /**
   * Menambah atau memperbarui beberapa cerita dalam satu transaksi.
   * @param {Array<object>} stories - Array objek cerita.
   */
  async putAllStories(stories) {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // Jalankan semua operasi 'put' secara bersamaan
    await Promise.all(stories.map(story => store.put(story)));
    return tx.done;
  },
 
  /**
   * Menghapus satu cerita berdasarkan ID.
   * @param {string} id - ID cerita.
   */
  async deleteStory(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  },
};
 
export default StoriesDb;