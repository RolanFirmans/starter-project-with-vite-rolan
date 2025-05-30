export default class Camera {
  static currentStream = null;

  static async init(videoElement) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
      Camera.currentStream = stream;

      if (!Array.isArray(window.currentStreams)) {
        window.currentStreams = [];
      }
      window.currentStreams.push(stream);

      return stream;
    } catch (err) {
      throw new Error("Gagal mengakses kamera: " + err.message);
    }
  }

  static stopAllStreams() {
    if (Array.isArray(window.currentStreams)) {
      window.currentStreams.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      window.currentStreams = [];
    }
  }
}
