export default class LoginPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async handleLogin(email, password) {
    if (!email || !password) {
      this.view.showError("Email dan password wajib diisi!");
      return;
    }

    try {
      const result = await this.model.login(email, password);
      localStorage.setItem("token", result.loginResult.token);
      localStorage.setItem("name", result.loginResult.name);
      this.view.showSuccess(
        "Anda berhasil login. Mengarahkan ke halaman utama..."
      );
    } catch (error) {
      this.view.showError(`Terjadi kesalahan: ${error.message}`);
    }
  }
}
