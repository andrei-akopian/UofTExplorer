import { Link } from 'react-router-dom'
import styles from '../styles/home.module.css'

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <h1>ArtSci Atlas</h1>
      <div className={styles.introText}>
        Welcome! Explore how courses, programs, and departments are connected at the Faculty of Arts & Science at the
        University of Toronto.
      </div>
      <div className={styles.introText}>
        All data is sourced from the <a href="https://artsci.calendar.utoronto.ca/" target="_blank" rel="noreferrer">Arts & Science
          Academic Calendar</a>.
      </div>
      
      <div className={styles.sectionBlock}>
        <h2>Graph Explorer: <Link to="/2dgraph">2D Graph</Link> | <Link to="/3dforcegraph">3D
            Graph</Link></h2>
        <div>Explore the prerequisite connections between courses, programs, and departments through interactive graph
          visualizations.
        </div>
        <div style={{ fontStyle: 'italic', marginTop: '0.5em' }}>
          Note: Loading large graphs may take a few minutes and use a significant amount of computer memory.
        </div>
      </div>
      
      <div className={styles.sectionBlock}>
        <h2><Link to="/globalstats">Global Statistics</Link></h2>
        <div>Get an overview of the global statistics across courses at the Faculty of Arts & Science.</div>
      </div>
      
      <div className={styles.sectionBlock}>
        <h2><Link to="/pathexplorer">Path Explorer</Link></h2>
        <div>
          Find out which courses you're eligible to take, and discover the shortest path to reach your desired
          courses.
        </div>
      </div>
    </div>
  )
}
