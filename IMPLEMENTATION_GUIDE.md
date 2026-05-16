# Implementation Guide for Frontend Migration

## Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture Overview

The migrated React frontend follows a modular architecture:

```
src/
├── pages/           # Page components (routed)
├── components/      # Reusable UI components
├── hooks/          # React hooks (data fetching, state management)
├── lib/            # Utilities and API client
├── styles/         # CSS files organized by page
├── types.ts        # TypeScript type definitions
├── App.tsx         # Router setup
└── main.tsx        # Entry point
```

## Data Flow

### Graph Fetching Flow
```
User Search Query
    ↓
Graph2D.tsx component
    ↓
useFetchGraph hook
    ↓
api.fetchGraphData()
    ↓
POST /api/fetch_graph
    ↓
Flask Backend processes query
    ↓
Returns GraphData JSON
    ↓
Hook updates state
    ↓
vis-network renders graph
```

## Implementation Checklist

### 1. Complete 2D Graph Component

**File**: `src/pages/Graph2D.tsx`

**TODO**:
- [ ] Implement vis-network initialization (partially done)
- [ ] Connect graph data fetching to vis-network
- [ ] Implement node click handlers to show course info
- [ ] Implement node filtering (CR/NCR, departments, breadth)
- [ ] Add search result highlighting
- [ ] Implement shell layout physics
- [ ] Create side panel for course details
- [ ] Add statistics panel

**Key Functions to Implement**:
```typescript
// Already partially implemented:
- prepareData() - formats nodes for layout
- fetchGraph() - fetches data from API
- handleFetchClick() - initiates fetch

// Still needed:
- showCourseInfo() - display course details in side panel
- applyGraphData() - render to vis-network
- centerCamera() - center view on graph
- focusNode() - highlight specific node
```

**Example Implementation**:
```typescript
const applyGraphData = (data: GraphData) => {
  if (!networkRef.current) return
  
  const prepared = prepareData(data.nodes, data.edges)
  setActiveNodes(prepared.nodes)
  
  networkRef.current.setData({
    nodes: prepared.nodes,
    edges: prepared.edges
  })
  networkRef.current.startSimulation()
}
```

### 2. Complete 3D Graph Component

**File**: `src/pages/Graph3D.tsx`

**TODO**:
- [ ] Integrate 3d-force-graph library
- [ ] Initialize Three.js scene
- [ ] Implement camera controls
- [ ] Add node/edge rendering
- [ ] Connect to API like 2D graph
- [ ] Add side panels for course info

**Key Implementation Points**:
- Use `useRef` to hold 3D graph instance
- Initialize in `useEffect` on component mount
- Use same `useFetchGraph` hook for data
- Format node positions for 3D space

**Example**:
```typescript
import ForceGraph3D from '3d-force-graph'

useEffect(() => {
  if (!containerRef.current) return
  
  const graph = new ForceGraph3D()(containerRef.current)
  graphRef.current = graph
  
  return () => graph?._destructor?.()
}, [])
```

### 3. Complete Path Explorer Component

**File**: `src/pages/PathExplorer.tsx`

**TODO**:
- [ ] Implement course search for each input
- [ ] Add course chip management
- [ ] Implement path solving via API
- [ ] Visualize path in network
- [ ] Show progress while solving
- [ ] Display results

**Key Functions Needed**:
```typescript
// Manage selected courses
const addCourse = (type: 'completed' | 'desired' | 'avoided', course: string) => {}
const removeCourse = (type: 'completed' | 'desired' | 'avoided', course: string) => {}

// Solve path
const handleSolvePath = async () => {
  try {
    const result = await solvePath({
      completed: selectedCourses.completed,
      desired: selectedCourses.desired,
      avoided: selectedCourses.avoided
    })
    // Visualize path
  } catch (err) {
    setError(err.message)
  }
}
```

### 4. Complete Global Statistics Component

**File**: `src/pages/GlobalStats.tsx`

**TODO**:
- [ ] Fetch statistics on component mount
- [ ] Populate statistics table dynamically
- [ ] Load chart images from `/images/` endpoint
- [ ] Add loading states
- [ ] Add error handling

**Example**:
```typescript
useEffect(() => {
  const loadStats = async () => {
    try {
      setLoading(true)
      const stats = await fetchGlobalStats()
      setStatistics(stats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  loadStats()
}, [])
```

## Backend API Endpoints Required

The Flask backend needs to expose these endpoints:

### 1. **POST** `/api/fetch_graph`
```json
Request:
{
  "query": "MAT332H1",
  "cr_ncr": ["eligible", "ineligible"],
  "departments": ["MAT"],
  "breadth_requirements": ["BR1", "BR2"]
}

Response:
{
  "nodes": [{"id": "MAT332H1", "label": "Real Analysis II", ...}],
  "edges": [{"from": "MAT137H1", "to": "MAT332H1"}],
  "search": "MAT332H1",
  "curr_query": {"type": "course", "code": "MAT332H1", "name": "Real Analysis II"}
}
```

### 2. **GET** `/api/search?q=MAT&limit=50`
```json
Response:
[
  {"id": "MAT137H1", "label": "Calculus!", "code": "MAT137H1", "type": "course"},
  {"id": "MAT332H1", "label": "Real Analysis II", "code": "MAT332H1", "type": "course"}
]
```

### 3. **GET** `/api/stats`
```json
Response:
{
  "total_courses": 1234,
  "total_programs": 56,
  "total_departments": 45,
  "avg_prerequisites": 2.3,
  "courses_with_cr_ncr": 980
}
```

### 4. **POST** `/api/solve_path`
```json
Request:
{
  "completed": ["MAT137H1", "MAT138H1"],
  "desired": ["MAT332H1"],
  "avoided": ["MAT334H1"]
}

Response:
{
  "path": ["MAT137H1", "MAT235H1", "MAT332H1"],
  "length": 3,
  "feasible": true
}
```

### 5. **GET** `/api/course/{code}`
```json
Response:
{
  "code": "MAT332H1",
  "name": "Real Analysis II",
  "description": "...",
  "credits": 1.0,
  "breadth": "BR2",
  "cr_ncr": true,
  "prerequisites": ["MAT235H1"],
  "exclusions": ["MAT332Y1"]
}
```

### 6. **GET** `/api/departments`
```json
Response: ["MAT", "PHY", "CSC", ...]
```

### 7. **GET** `/api/breadth_categories`
```json
Response: ["BR1", "BR2", "BR3", "BR4", "BR5"]
```

## Updating Flask Backend

In `server/server.py`, add these new endpoints:

```python
@app.route('/api/fetch_graph', methods=['POST'])
def api_fetch_graph():
    data = request.json
    # Process query and filters
    # Return graph data
    return jsonify(result)

@app.route('/api/search')
def api_search():
    query = request.args.get('q', '')
    # Search logic
    return jsonify(results)

# ... other endpoints
```

## Testing

### Unit Testing
```bash
npm run test
```

### Development Testing
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build Testing
```bash
npm run build
npm run preview
```

## Common Issues & Solutions

### Issue: "Cannot find module 'vis-network'"
**Solution**: Run `npm install vis-network`

### Issue: Graph not rendering
**Solution**: Check that:
1. `containerRef` is properly assigned to DOM element
2. Network is initialized after component mounts
3. Data is being passed correctly to `network.setData()`

### Issue: API calls fail with CORS error
**Solution**: Update Flask to enable CORS:
```python
from flask_cors import CORS
CORS(app)
```

### Issue: Performance is slow with large graphs
**Solution**:
1. Implement node clustering
2. Use virtual scrolling for search results
3. Optimize physics simulation parameters
4. Consider WebWorkers for heavy computation

## Performance Optimization Tips

1. **Memoize Components**:
```typescript
const Graph2D = React.memo(({ data }) => {...})
```

2. **Use useCallback for handlers**:
```typescript
const handleClick = useCallback((e) => {
  // handler logic
}, [dependencies])
```

3. **Lazy load heavy libraries**:
```typescript
const ForceGraph = lazy(() => import('3d-force-graph'))
```

4. **Optimize re-renders**:
```typescript
const [nodeCount, setNodeCount] = useState(0)
// Use derived state instead of recalculating
```

## Debugging

### React DevTools
- Install React DevTools browser extension
- Check component hierarchy and state

### Browser DevTools
- Network tab: Check API requests
- Console: Check for errors
- Performance tab: Profile rendering

### VS Code Debugging
Add to `.vscode/launch.json`:
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/frontend"
}
```

## Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [vis-network Documentation](https://visjs.github.io/vis-network/docs/network/)
- [3d-force-graph](https://github.com/vasturiano/3d-force-graph)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
