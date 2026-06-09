import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Home", href: "/" },
  { label: "2D Graph", href: "/graph/2d" },
  { label: "3D Graph", href: "/graph/3d" },
  { label: "Path Explorer", href: "/path-explorer" },
  { label: "Global Statistics", href: "/global-stats" },
];

const navLink = (active: boolean) =>
  `font-sans flex items-center whitespace-nowrap px-3 md:px-6 h-full text-sm border-b-2 transition-colors duration-150 ${
    active
      ? "text-gray-900 border-gray-900"
      : "text-gray-500 border-transparent hover:text-gray-800"
  }`;

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="flex h-16 items-center overflow-x-auto border-b border-gray-100 bg-white px-4 shadow-sm md:px-12 lg:px-20">
      {/* Nav links */}
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
        {links.map(({ label, href }) => (
          <Link key={href} to={href} className={navLink(pathname === href)}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
