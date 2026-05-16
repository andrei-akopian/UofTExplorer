# Flask to React Migration Summary

## Overview
Successfully migrated the pure HTML + Flask frontend from `/server/` to a modern React + TypeScript frontend in `/frontend/`.

## Completed Migrations

### 1. **Routing Structure** ✅
- **File**: `src/App.tsx`
- Implemented React Router with 5 main routes:
  - `/` - Home page
  - `/2dgraph` - 2D Graph Explorer
  - `/3dforcegraph` - 3D Graph Explorer
  - `/pathexplorer` - Path Explorer
  - `/globalstats` - Global Statistics

### 2. **Page Components** ✅

#### Home Page (`src/pages/Home.tsx`)
- Migrated from `server/templates/index.html`
- Features:
  - Navigation links to all other pages
  - Welcome text and information
  - Link styling with React Router

#### 2D Graph Page (`src/pages/Graph2D.tsx`)
- Migrated from `server/templates/2dgraph.html`
- Features:
  - vis-network graph visualization integration
  - Search functionality
  - Filter dropdowns (CR/NCR, Departments, Breadth Requirements)
  - Side panels for course info and statistics
  - Shell layout option
  - Physics simulation for graph layout
- **Status**: Skeleton in place, needs vis-network initialization logic

#### 3D Graph Page (`src/pages/Graph3D.tsx`)
- Migrated from `server/templates/3dforcegraph.html`
- Features:
  - Layout similar to 2D Graph
  - Switch button to 2D view
  - Placeholder for 3d-force-graph library
- **Status**: UI structure in place, needs 3d-force-graph implementation

#### Path Explorer Page (`src/pages/PathExplorer.tsx`)
- Migrated from `server/templates/pathexplorer.html`
- Features:
  - Three-section layout (left/right/center inputs)
  - Course selection and removal
  - Path finding button
  - Progress tracking
  - Network visualization area
- **Status**: UI structure in place, needs pathfinding logic

#### Global Statistics Page (`src/pages/GlobalStats.tsx`)
- Migrated from `server/templates/globalstats.html`
- Features:
  - Statistical data tables
  - Academic report formatting
  - Chart placeholders
  - Navigation links
- **Status**: UI structure complete, needs data loading

### 3. **Styling** ✅

Migrated and converted all CSS files to React-compatible format:

- `src/styles/home.css` - Home page styling
- `src/styles/graph2d.css` - 2D Graph styling  
- `src/styles/graph3d.css` - 3D Graph styling
- `src/styles/pathexplorer.css` - Path Explorer styling
- `src/styles/globalstats.css` - Global Statistics styling
- `src/App.css` - Global application styles

All CSS uses:
- CSS custom properties (variables)
- Responsive design with media queries
- Semantic HTML-friendly class names
- Accessibility-focused styling

### 4. **Dependencies Installed** ✅

```json
{
  "react-router-dom": "^latest",
  "vis-network": "^latest",
  "three": "^0.160.0",
  "three-spritetext": "^1.8.2",
  "3d-force-graph": "^1.73.3"
}
```

## Remaining Tasks

### 1. **Graph Logic Implementation** 🔄
- [ ] Complete vis-network initialization in 2D Graph component
- [ ] Implement graph data fetching and processing
- [ ] Add physics simulation and layout algorithms
- [ ] Implement node selection and hover effects
- [ ] Connect to Flask backend API endpoints

### 2. **3D Graph Implementation** 🔄
- [ ] Integrate 3d-force-graph library
- [ ] Implement Three.js scene setup
- [ ] Add mouse interactions (click, drag, zoom)
- [ ] Connect to Flask backend API

### 3. **Path Explorer Implementation** 🔄
- [ ] Implement course search functionality
- [ ] Add course chip/tag management
- [ ] Implement pathfinding algorithm UI
- [ ] Add progress tracking
- [ ] Connect to Flask backend API

### 4. **Global Statistics** 🔄
- [ ] Fetch statistics from backend API
- [ ] Populate data tables dynamically
- [ ] Load chart images from `/images/` endpoint
- [ ] Add loading states

### 5. **API Integration** 🔄
- [ ] Create API client utilities
- [ ] Update Flask backend to serve API endpoints:
  - `/api/fetch_graph` - Graph data endpoint
  - `/api/search` - Search functionality
  - `/api/stats` - Statistics data
  - `/api/solve_path` - Path explorer solver
- [ ] Handle CORS for development

### 6. **Testing & Optimization** 🔄
- [ ] Test all page routing
- [ ] Test responsive design
- [ ] Optimize graph rendering performance
- [ ] Add error handling and user feedback
- [ ] Cross-browser testing

## Key Migration Decisions

1. **React Router**: Used for client-side routing instead of Flask routing
2. **TypeScript**: Added type safety for React components
3. **CSS Structure**: Organized CSS by page/feature for maintainability
4. **Component Pattern**: Separated pages and components for reusability
5. **Vite**: Using Vite instead of Create React App for faster builds

## API Integration Points

The React frontend expects the following Flask API endpoints:

### `POST /api/fetch_graph`
```json
Request: {
  "query": "MAT332H1",
  "cr_ncr": ["eligible"],
  "departments": ["MAT"],
  "breadth_requirements": ["BR1"]
}

Response: {
  "nodes": [...],
  "edges": [...],
  "search": "MAT332H1",
  "curr_query": {"type": "course", "code": "MAT332H1", "name": "..."}
}
```

### `GET /api/search?q={query}`
```json
Response: [
  {"id": "...", "label": "...", "code": "..."},
  ...
]
```

### `GET /api/stats`
```json
Response: {
  "total_courses": 1234,
  "total_programs": 123,
  ...
}
```

### `POST /api/solve_path`
```json
Request: {
  "completed": ["MAT137H1"],
  "desired": ["MAT332H1"],
  "avoided": []
}

Response: {
  "path": ["MAT137H1", ..., "MAT332H1"],
  "length": 3
}
```

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Graph2D.tsx
│   │   ├── Graph3D.tsx
│   │   ├── PathExplorer.tsx
│   │   └── GlobalStats.tsx
│   ├── styles/
│   │   ├── home.css
│   │   ├── graph2d.css
│   │   ├── graph3d.css
│   │   ├── pathexplorer.css
│   │   └── globalstats.css
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
└── package.json
```

## Next Steps

1. Run `npm run dev` to start the development server
2. Implement graph logic in 2D Graph component
3. Create API client utilities for backend communication
4. Update Flask server to expose API endpoints
5. Test each page functionality
6. Optimize performance for large graphs

## Notes

- The original Flask templates used Jinja2 templating which is not needed in React
- Graph data was previously passed to frontend via server-rendered templates; now needs to be fetched via API
- All CSS has been converted to standard CSS (no SCSS/LESS) for simplicity
- Responsive design maintained from original implementation
