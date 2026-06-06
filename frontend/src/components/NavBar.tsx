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
      ? "text-gray-900 border-gray-900"
      : "text-gray-500 border-transparent hover:text-gray-800"
  }`;

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="flex h-16 items-center border-b border-gray-100 bg-white px-20 shadow-sm">
      {/* Nav links */}
      <div className="flex flex-1 items-center justify-center gap-12">
        {links.map(({ label, href }) => (
          <Link key={href} to={href} className={navLink(pathname === href)}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
