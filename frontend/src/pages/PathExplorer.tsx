import { Link } from 'react-router-dom'
import styles from '../styles/pathexplorer.module.css'

export default function PathExplorer() {
  return (
    <div className={styles.pathexplorerContainer}>
      <div id="mynetwork"></div>
      
      <a href="/" className={styles.homelink} title="Back to home">
        <svg width="2rem" height="2rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z" fill="#000000" />
        </svg>
      </a>

      <div id="controls">
        <div id="topSection" className={styles.topSection}>
          <div className={`${styles.searchShell} ${styles.searchShellLeft}`}>
            <div className={styles.searchHeader}>
              <label className={styles.searchLabel} htmlFor="completedSearch">
                Courses you already took
                <span className={styles.stackCount}>0</span>
              </label>
              <button
                id="immediatePostreqsButton"
                type="button"
                className={styles.immediatePostreqsButton}
                title="Get immediate post-requisites"
              >
                What Courses Can I Take Next?
              </button>
            </div>
            <input
              id="completedSearch"
              type="text"
              className={styles.courseSearch}
              placeholder="Add a completed course"
              autoComplete="off"
            />
            <div className={styles.selectedCourses}></div>
            <div className={styles.searchResults}></div>
          </div>

          <div className={`${styles.searchShell} ${styles.searchShellRight}`}>
            <label className={styles.searchLabel} htmlFor="avoidedSearch">
              Courses you want to avoid
              <span className={styles.stackCount}>0</span>
            </label>
            <input
              id="avoidedSearch"
              type="text"
              className={styles.courseSearch}
              placeholder="Add a course to avoid"
              autoComplete="off"
            />
            <div className={styles.selectedCourses}></div>
            <div className={styles.searchResults}></div>
          </div>

          <div className={`${styles.searchShell} ${styles.searchShellCenter}`}>
            <label className={styles.searchLabel} htmlFor="desiredSearch">
              Courses you want to take
              <span className={styles.stackCount}>0</span>
            </label>
            <input
              id="desiredSearch"
              type="text"
              className={styles.courseSearch}
              placeholder="Add a target course"
              autoComplete="off"
            />
            <div className={styles.selectedCourses}></div>
            <div className={styles.searchResults}></div>
          </div>
        </div>

        <div id="bottomSection" className={styles.bottomSection}>
          <div className={styles.titleBlock}>
            <h3 id="title">Find the shortest path to your academic desires</h3>
          </div>
          <button id="demoSendButton" type="button" className={styles.demoButton}>
            Run Path Explorer
          </button>
          <div id="progressContainer" className={styles.progressContainer} style={{ display: 'none' }}>
            <p id="fundamentalsInfo" className={styles.progressInfo}></p>
            <p id="progressStatus" className={styles.progressStatus}>Starting...</p>
            <button id="cancelSolverButton" type="button" className={styles.cancelButton}>
              Cancel
            </button>
          </div>
          <div id="warningContainer" className={styles.warningContainer} style={{ display: 'none' }}>
            <div className={styles.warningMessage}>
              <span className={styles.warningIcon}>⚠️</span>
              <span id="warningText"></span>
            </div>
          </div>
        </div>
      </div>

      <p id="requestStatus" className={styles.requestStatus} aria-live="polite"></p>
    </div>
  )
}
