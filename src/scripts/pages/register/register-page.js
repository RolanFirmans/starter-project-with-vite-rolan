import RegisterPresenter from "../register/register-persenter";
import Swal from "sweetalert2";

const Register = {
  async render() {
    return `
      <section class="register">
        <h2>Daftar Akun Ceritaku</h2>
        <form id="registerForm">
          <input type="text" id="name" placeholder="Nama Lengkap" required />
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
        <p>Sudah punya akun? <a href="#/">Login di sini</a></p>
        <div id="registerMessage"></div>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#registerForm");
    const message = document.querySelector("#registerMessage");

    const data = {
      name: "User Nama",
      email: "user@mail.com",
      password: "rahasia",
    };

    if (!navigator.onLine) {
      localStorage.setItem("pendingRegister", JSON.stringify(data));
      alert("Kamu sedang offline. Data akan dikirim saat kamu online kembali.");
    } else {
      fetch("https://story-api.dicoding.dev/v1/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }


    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.querySelector("#name").value;
      const email = document.querySelector("#email").value;
      const password = document.querySelector("#password").value;

      await RegisterPresenter.registerUser(name, email, password, this);
    });
  },

  showSuccessMessage(message) {
    const messageElem = document.querySelector("#registerMessage");
    messageElem.textContent = message;
    messageElem.style.color = "green";
  },

  showErrorMessage(message) {
    const messageElem = document.querySelector("#registerMessage");
    messageElem.textContent = message;
    messageElem.style.color = "red";
  },

  showSuccessAlert(title, text) {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      confirmButtonText: "OK",
    });
  },
  // Menampilkan SweetAlert error
  showErrorAlert(title, text) {
    Swal.fire({
      title: title,
      text: text,
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  },
};

export default Register;
