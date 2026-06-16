import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const links = [
  { label: "Home", href: "/" },
  { label: "2D Graph", href: "/graph/2d" },
  { label: "3D Graph", href: "/graph/3d" },
  { label: "Path Explorer", href: "/path-explorer" },
  { label: "Global Statistics", href: "/global-stats" },
];

const navLink = (active: boolean) =>
  `font-sans flex h-10 shrink-0 items-center whitespace-nowrap border-b-2 px-2 text-xs transition-colors duration-150 sm:px-3 sm:text-sm md:h-full md:px-5 ${
    active
      ? "text-text-body border-text-subtle"
      : "text-text-muted border-transparent hover:text-text-secondary"
  }`;

const mobileNavLink = (active: boolean) =>
  `font-sans flex w-full items-center border-b px-4 py-3 text-sm transition-colors duration-150 ${
    active
      ? "text-text-body border-border-panel font-semibold"
      : "text-text-muted border-border-panel hover:text-text-secondary"
  }`;

const THEME_STORAGE_KEY = "uoft-explorer-theme";

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "dark") {
    return true;
  }
  if (savedTheme === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function Navbar() {
  const { pathname } = useLocation();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDarkMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const activePageLabel =
    links.find(({ href }) => href === pathname)?.label ?? "Home";

  // Close menu when navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu when resizing to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDarkMode]);

  const themeToggle = (
    <button
      type="button"
      onClick={() => setIsDarkMode((prev) => !prev)}
      className="border-input-border bg-input-bg text-text-body focus:ring-input-focus-ring inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:brightness-105 focus:ring-2 focus:outline-none"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span>{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );

  return (
    <nav className="border-border-panel bg-panel-bg shadow-card border-b">
      {/* Top bar */}
      <div className="flex min-h-16 items-center px-3 sm:px-4 md:px-8 lg:px-20">
        {/* Logo + active page (mobile) */}
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/"
            className="font-display text-text-body shrink-0 text-sm font-semibold whitespace-nowrap no-underline sm:text-base"
          >
            UofT Explorer
          </Link>
          <span className="text-text-muted max-w-32 truncate text-sm font-semibold md:hidden">
            {activePageLabel}
          </span>
        </div>

        {/* Desktop: nav links centered + toggle right */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto md:flex">
          {links.map(({ label, href }) => (
            <Link key={href} to={href} className={navLink(pathname === href)}>
              {label}
            </Link>
          ))}
        </div>
        <div className="ml-auto hidden sm:translate-x-0 md:block md:translate-x-4 lg:translate-x-16">
          {themeToggle}
        </div>

        {/* Mobile: hamburger button */}
        <button
          type="button"
          className="text-text-body ml-auto rounded-md p-2 transition-colors hover:bg-black/5 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-border-panel bg-panel-bg flex flex-col border-t md:hidden">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className={mobileNavLink(pathname === href)}
            >
              {label}
            </Link>
          ))}
          <div className="border-border-panel border-t px-4 py-3">
            {themeToggle}
          </div>
        </div>
      )}
    </nav>
  );
}
