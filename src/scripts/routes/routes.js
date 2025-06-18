import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import Login from '../pages/login/login-page';
import AddPage from '../pages/Addstory/add-story-page'
import Register from '../pages/register/register-page';
import FavoritePage from '../pages/favorite-page';
const routes = {
  '/': HomePage,
  '/login': Login,
  '/register': Register,
  '/add': AddPage,
  '/about': AboutPage,
  '/favorite': FavoritePage,
};

export default routes;
