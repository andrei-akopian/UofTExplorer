import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Graph2D from './pages/Graph2D'
import Graph3D from './pages/Graph3D'
import PathExplorer from './pages/PathExplorer'
import GlobalStats from './pages/GlobalStats'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/2dgraph" element={<Graph2D />} />
        <Route path="/3dforcegraph" element={<Graph3D />} />
        <Route path="/pathexplorer" element={<PathExplorer />} />
        <Route path="/globalstats" element={<GlobalStats />} />
      </Routes>
    </Router>
  )
}

export default App
