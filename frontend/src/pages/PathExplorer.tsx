import { Link } from 'react-router-dom'
import '../styles/pathexplorer.css'

export default function PathExplorer() {
  return (
    <div className="pathexplorer-container">
      <div id="mynetwork"></div>
      
      <a href="/" className="homelink" title="Back to home">
        <svg width="2rem" height="2rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z" fill="#000000" />
        </svg>
      </a>

      <div id="controls">
        <div id="topSection" className="top-section">
          <div className="search-shell search-shell-left">
            <div className="search-header">
              <label className="search-label" htmlFor="completedSearch">
                Courses you already took
                <span className="stack-count">0</span>
              </label>
              <button
                id="immediatePostreqsButton"
                type="button"
                className="immediate-postreqs-button"
                title="Get immediate post-requisites"
              >
                What Courses Can I Take Next?
              </button>
            </div>
            <input
              id="completedSearch"
              type="text"
              className="course-search"
              placeholder="Add a completed course"
              autoComplete="off"
            />
            <div className="selected-courses"></div>
            <div className="search-results"></div>
          </div>

          <div className="search-shell search-shell-right">
            <label className="search-label" htmlFor="avoidedSearch">
              Courses you want to avoid
              <span className="stack-count">0</span>
            </label>
            <input
              id="avoidedSearch"
              type="text"
              className="course-search"
              placeholder="Add a course to avoid"
              autoComplete="off"
            />
            <div className="selected-courses"></div>
            <div className="search-results"></div>
          </div>

          <div className="search-shell search-shell-center">
            <label className="search-label" htmlFor="desiredSearch">
              Courses you want to take
              <span className="stack-count">0</span>
            </label>
            <input
              id="desiredSearch"
              type="text"
              className="course-search"
              placeholder="Add a target course"
              autoComplete="off"
            />
            <div className="selected-courses"></div>
            <div className="search-results"></div>
          </div>
        </div>

        <div id="bottomSection" className="bottom-section">
          <div className="title-block">
            <h3 id="title">Find the shortest path to your academic desires</h3>
          </div>
          <button id="demoSendButton" type="button" className="demo-button">
            Run Path Explorer
          </button>
          <div id="progressContainer" className="progress-container" style={{ display: 'none' }}>
            <p id="fundamentalsInfo" className="progress-info"></p>
            <p id="progressStatus" className="progress-status">Starting...</p>
            <button id="cancelSolverButton" type="button" className="cancel-button">
              Cancel
            </button>
          </div>
          <div id="warningContainer" className="warning-container" style={{ display: 'none' }}>
            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <span id="warningText"></span>
            </div>
          </div>
        </div>
      </div>

      <p id="requestStatus" className="request-status" aria-live="polite"></p>
    </div>
  )
}
