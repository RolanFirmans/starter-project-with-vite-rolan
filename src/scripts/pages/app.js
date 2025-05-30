import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  // app.js
  async renderPage() {
    const page = routes[window.location.hash.slice(1) || "/"];
    const content = document.querySelector("#mainContent");
    
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      content.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default App;
