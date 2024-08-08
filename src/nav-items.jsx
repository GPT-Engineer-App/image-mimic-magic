import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    page: Index,
  },
  {
    title: "Login",
    to: "/login",
    page: Login,
  },
];
