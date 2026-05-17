import { Link } from 'react-router-dom'
import styles from '../styles/graph3d.module.css'

export default function Graph3D() {
  return (
    <div className={styles.graph3dContainer}>
      <div id="graph"></div>
      
      <a href="/" className={styles.homelink} title="Back to home">
        <svg width="2rem" height="2rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z" fill="#000000" />
        </svg>
      </a>

      <details className={`${styles.settings} close-on-outclick`}>
        <summary>
          <svg width="2.5rem" height="2.5rem" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="out" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <path d="M18.1125649,13.0304195 C18.1454626,12.7672379 18.1701359,12.5040563 18.1701359,12.2244258 C18.1701359,11.9447953 18.1454626,11.6816137 18.1125649,11.4184321 L19.8479188,10.0614018 C20.0041828,9.93803541 20.045305,9.71597592 19.9466119,9.53503855 L18.3017267,6.68938723 C18.2030336,6.50844986 17.9809741,6.44265446 17.8000367,6.50844986 L15.7521547,7.33089244 C15.3244846,7.00191541 14.8639167,6.73050936 14.3622268,6.52489871 L14.0496986,4.34542588 C14.0250253,4.14803966 13.8523124,4 13.6467017,4 L10.3569314,4 C10.1513208,4 9.97860782,4.14803966 9.95393455,4.34542588 L9.64140637,6.52489871 C9.13971639,6.73050936 8.67914855,7.01013984 8.25147841,7.33089244 L6.20359639,6.50844986 C6.0144346,6.43443003 5.80059953,6.50844986 5.70190642,6.68938723 L4.05702126,9.53503855 C3.95010373,9.71597592 3.99945028,9.93803541 4.15571437,10.0614018 L5.89106821,11.4184321 C5.85817051,11.6816137 5.83349723,11.9530197 5.83349723,12.2244258 C5.83349723,12.4958318 5.85817051,12.7672379 5.89106821,13.0304195 L4.15571437,14.3874498 C3.99945028,14.5108161 3.95832815,14.7328756 4.05702126,14.913813 L5.70190642,17.7594643 C5.80059953,17.9404017 6.02265902,18.0061971 6.20359639,17.9404017 L8.25147841,17.1179591 C8.67914855,17.4469361 9.13971639,17.7183422 9.64140637,17.9239528 L9.95393455,20.1034257 C9.97860782,20.3008119 10.1513208,20.4488516 10.3569314,20.4488516 L13.6467017,20.4488516 C13.8523124,20.4488516 14.0250253,20.3008119 14.0496986,20.1034257 L14.3622268,17.9239528 C14.8639167,17.7183422 15.3244846,17.4387117 15.7521547,17.1179591 L17.8000367,17.9404017 C17.9891985,18.0144215 18.2030336,17.9404017 18.3017267,17.7594643 L19.9466119,14.913813 C20.045305,14.7328756 20.0041828,14.5108161 19.8479188,14.3874498 L18.1125649,13.0304195 Z M12.0018166,15.1029748 C10.4145024,15.1029748 9.12326754,13.81174 9.12326754,12.2244258 C9.12326754,10.6371116 10.4145024,9.34587676 12.0018166,9.34587676 C13.5891307,9.34587676 14.8803656,10.6371116 14.8803656,12.2244258 C14.8803656,13.81174 13.5891307,15.1029748 12.0018166,15.1029748 Z" fill="#000000" />
            </g>
          </svg>
        </summary>
        <div className={`${styles.filterOptions} ${styles.settingsOptions}`}>
          <label className={styles.filterOption}>
            <input type="checkbox" defaultChecked />
            <span>Use shell layout</span>
          </label>
        </div>
      </details>

      <div className={styles.cornerSwitch}>
        <Link to="/2dgraph" className={`${styles.viewSwitchButton} ${styles.cornerSwitchButton}`} title="Switch to 2D view">
          2D→
        </Link>
      </div>

      <div id="controls">
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            id="queryInput"
            placeholder="Search for course, program, department, or 'all'"
            autoComplete="off"
          />
          <div id="searchResults"></div>
        </div>
        
        <details className={`${styles.filterDropdown} close-on-outclick`}>
          <summary>CR / NCR</summary>
          <div id="crNcrFilterOptions" className={styles.filterOptions}></div>
        </details>

        <details className={`${styles.filterDropdown} close-on-outclick`}>
          <summary>Departments</summary>
          <div id="departmentFilterOptions" className={styles.filterOptions}></div>
        </details>

        <details className={`${styles.filterDropdown} close-on-outclick`}>
          <summary>Breadth Requirements</summary>
          <div id="breadthFilterOptions" className={styles.filterOptions}></div>
        </details>

        <button id="fetchButton">Fetch New Graph</button>

        <div className={styles.statusStack}>
          <div id="currQueryDisplay" className={styles.currQueryDisplay}></div>
          <div id="message"></div>
        </div>
      </div>
    </div>
  )
}
