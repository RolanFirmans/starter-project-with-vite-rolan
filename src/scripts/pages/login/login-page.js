import LoginPresenter from "./login-presenter.js";
import LoginModel from "../../data/login-model.js";
import Swal from "sweetalert2";

const Login = {
  async render() {
    return `
      <section class="login">
        <h2>Login ke Ceritaku</h2>
        <form id="loginForm">
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        <div id="loginMessage"></div>
      </section>
    `;
  },

  async afterRender() {
    const presenter = new LoginPresenter(this, LoginModel);

    document.querySelector("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.querySelector("#email").value;
      const password = document.querySelector("#password").value;

      presenter.handleLogin(email, password);
    });
  },

  showSuccess(message) {
    document.querySelector("#loginMessage").textContent = message;
    document.querySelector("#loginMessage").style.color = "green";

    Swal.fire({
      title: "Login Berhasil",
      text: message,
      icon: "success",
      confirmButtonText: "OK",
    });

    setTimeout(() => {
      window.location.hash = "/";
    }, 1500);
  },

  showError(message) {
    document.querySelector("#loginMessage").textContent = message;
    document.querySelector("#loginMessage").style.color = "red";

    Swal.fire({
      title: "Login Gagal",
      text: message,
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  },
};

export default Login;
