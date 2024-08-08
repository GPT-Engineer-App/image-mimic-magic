import Index from "./pages/Index.jsx";
import Profile from "./pages/Profile.jsx";

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
    title: "Profile",
    to: "/profile",
    page: Profile,
  },
];
