import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Home", href: "/" },
  { label: "Path Explorer", href: "/path-explorer" },
  { label: "Global Statistics", href: "/global-stats" },
];

const graphLinks = [
  { label: "2D Graph", href: "/graph/2d" },
  { label: "3D Graph", href: "/graph/3d" },
];

const navLink = (active: boolean) =>
  `font-sans px-6 h-full text-sm border-b-2 transition-colors duration-150 ${
    active
      ? "text-gray-900 border-gray-900"
      : "text-gray-500 border-transparent hover:text-gray-800"
  }`;

export default function Navbar() {
  const { pathname } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isGraphActive = graphLinks.some((l) => l.href === pathname);

  return (
    <nav className="flex h-16 items-center border-b border-gray-100 bg-white px-20 shadow-sm">
      {/* Nav links */}
      <div className="flex flex-1 items-center justify-center gap-12">
        {links.map(({ label, href }) => (
          <Link key={href} to={href} className={navLink(pathname === href)}>
            {label}
          </Link>
        ))}

        {/* Graph Explorer dropdown */}
        <div
          className="relative flex h-full items-center font-sans"
          ref={dropdownRef}
        >
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className={`flex items-center gap-1.5 ${navLink(isGraphActive)}`}
          >
            Graph Explorer
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`opacity-60 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 z-50 mt-px min-w-40 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
              {graphLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 font-sans text-sm text-gray-600 transition-colors duration-100 hover:bg-gray-50 hover:text-gray-900"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
