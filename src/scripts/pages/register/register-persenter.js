import RegisterModel from "../../data/register-model";
import Swal from "sweetalert2";

const RegisterPresenter = {
  async registerUser(name, email, password, view) {
    try {
      const result = await RegisterModel.register(name, email, password);

      view.showSuccessMessage("Registrasi berhasil! Silakan login.");
      view.showSuccessAlert(
        "Registrasi Berhasil",
        "Akun Anda telah berhasil dibuat. Silakan login."
      );

      setTimeout(() => {
        window.location.hash = "/login";
      }, 1500);
    } catch (error) {
      view.showErrorMessage(`Gagal daftar: ${error.message}`);
      view.showErrorAlert(
        "Registrasi Gagal",
        `Terjadi kesalahan: ${error.message}`
      );
    }
  },
};

export default RegisterPresenter;
