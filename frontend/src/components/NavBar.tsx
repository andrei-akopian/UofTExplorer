import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Home", href: "/" },
  { label: "2D Graph", href: "/graph/2d" },
  { label: "3D Graph", href: "/graph/3d" },
  { label: "Path Explorer", href: "/path-explorer" },
  { label: "Global Statistics", href: "/global-stats" },
];

const navLink = (active: boolean) =>
  `font-sans px-6 h-full text-sm border-b-2 transition-colors duration-150 ${
    active
      ? "text-text-body border-text-body"
      : "text-text-muted border-transparent hover:text-text-secondary"
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

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDarkMode]);

  return (
    <nav className="border-border-panel bg-panel-bg shadow-card flex h-16 items-center border-b px-20">
      <div className="w-36 shrink-0" />

      {/* Nav links */}
      <div className="flex flex-1 items-center justify-center gap-12">
        {links.map(({ label, href }) => (
          <Link key={href} to={href} className={navLink(pathname === href)}>
            {label}
          </Link>
        ))}
      </div>

      <div className="flex w-36 shrink-0 justify-end">
        <button
          type="button"
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="border-input-border bg-input-bg text-text-body focus:ring-input-focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:brightness-105 focus:ring-2 focus:outline-none"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
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
      </div>
    </nav>
  );
}
