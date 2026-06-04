import "./App.css";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Graph2D from "./pages/Graph2D";
import Graph3D from "./pages/Graph3D";
import PathExplorer from "./pages/PathExplorer";
import GlobalStats from "./pages/GlobalStats";
import NavBar from "./components/NavBar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/graph/2d": "2D Graph",
  "/graph/3d": "3D Graph",
  "/path-explorer": "Path Explorer",
  "/global-stats": "Global Statistics",
};

function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = PAGE_TITLES[location.pathname] ?? "UofT Explorer";
    document.title = `${pageTitle} | UofT Explorer`;
  }, [location.pathname]);

  return null;
}

function DropdownOutsideClickCloser() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const dropdowns = document.querySelectorAll<HTMLDetailsElement>(
        "details.close-on-outclick[open]",
      );

      dropdowns.forEach((dropdown) => {
        if (!target || !dropdown.contains(target)) {
          dropdown.removeAttribute("open");
        }
      });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <TitleManager />
      <DropdownOutsideClickCloser />
      <div className="flex h-screen flex-col">
        <NavBar />
        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/graph/2d" element={<Graph2D />} />
            <Route path="/graph/3d" element={<Graph3D />} />
            <Route path="/path-explorer" element={<PathExplorer />} />
            <Route path="/global-stats" element={<GlobalStats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
