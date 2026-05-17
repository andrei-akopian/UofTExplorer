import { Link } from 'react-router-dom'
import styles from '../styles/globalstats.module.css'

import course_length_pie_chart from '../assets/globalstats/course_length_pie_chart.svg'
import course_levels_pie from '../assets/globalstats/course_levels_pie.svg'
import departments_by_course_level from '../assets/globalstats/departments_by_course_level.svg'
import departments_by_hour_type from '../assets/globalstats/departments_by_hour_type.svg'
import distribution_of_departments_by_breadth_category from '../assets/globalstats/distribution_of_departments_by_breadth_category.svg'
import distribution_of_departments_by_breadth_span from '../assets/globalstats/distribution_of_departments_by_breadth_span.svg'
import distribution_of_programs_by_breadth_category from '../assets/globalstats/distribution_of_programs_by_breadth_category.svg'
import distribution_of_programs_by_breadth_span from '../assets/globalstats/distribution_of_programs_by_breadth_span.svg'
import distribution_of_sat_lengths from '../assets/globalstats/distribution_of_sat_lengths.svg'
import hours_per_course_histogram from '../assets/globalstats/hours_per_course_histogram.svg'
import number_of_direct_prereqs from '../assets/globalstats/number_of_direct_prereqs.svg'
import number_of_total_prereqs from '../assets/globalstats/number_of_total_prereqs.svg'

export default function GlobalStats() {
  return (
    <div className={styles.globalstatsContainer}>
      <article>
        <div style={{ textAlign: 'center', fontSize: '1.25rem', marginBottom: '1.5em' }}>
          <Link to="/">Home</Link> | <Link to="/2dgraph">2D Graph</Link> | <Link to="/3dforcegraph">3D Graph</Link> | <Link to="/pathexplorer">Path Explorer</Link>
        </div>

        <h1 style={{ textAlign: 'center' }}>Executive Report on the Global Statistics</h1>

        <div className={styles.author}>Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng <br />March 30, 2026</div>

        <div className={styles.abstract}>
          We explored the relationships between courses, programs, and departments at the Faculty of Arts & Science at
          the University of Toronto. This report summarizes the global statistics computed on our entire constructed graph.
          All data was pulled from the{' '}
          <a href="https://artsci.calendar.utoronto.ca/" target="_blank" rel="noreferrer">
            Arts & Science Academic Calendar
          </a>
          .
        </div>

        <h2>Statistics</h2>

        <div>We computed many statistical measures, with the following being done on the entire constructed graph.</div>

        <div className={styles.table} style={{ marginTop: '1em' }}>
          <caption>
            <span style={{ fontWeight: 'bold' }}>Table 1. </span>Statistics computed on the entire graph.
          </caption>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>Statistic</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Courses</td>
                <td>Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.indentPars}>
          <p>
            We can see that the Faculty of Arts & Science has a significant number of courses. Note that the number of
            requisites is the total number of Requisite objects stored by the complete CourseGraph, which undercounts the
            real number of prerequisites required by all courses due to our memory optimization of only keeping one copy of
            each unique Requisite object.
          </p>
          <p>
            The majority of courses are eligible for CR/NCR, but around one-fifth of the courses are not eligible.
          </p>
          <p>
            The distribution of courses across Breadth Requirement categories is less uniform than we expected. It is
            interesting that Breadth 1 and Breadth 3 each have roughly double the amount of courses compared to Breadth 2,
            Breadth 4, and Breadth 5.
          </p>
          <p>
            Direct prerequisites are defined as the number of CourseNode or Requisite objects located directly in the
            prerequisites of a course. The average number of direct prerequisites being below 1 indicates that the majority
            of courses do not have any prerequisites.
          </p>
          <p>
            Total prerequisites are defined as any course that is located in the Requisite tree downstream from the
            prerequisites of a CourseNode. Thus, higher-year courses with long chains of prerequisites will have a higher
            number of total prerequisites. While many courses do not have any prerequisites, there are enough courses with
            large numbers of prerequisites to bring the average up to 3.
          </p>
          <p>
            Finally, the Faculty of Arts & Science has a large number of programs and departments that span a variety of
            subject areas. It seems unlikely, though, that the number of programs is less than double the number of
            departments. The cause of this is likely that the glossary of departments that we scraped included some
            departments from other faculties at UofT, inflating the total number of departments.
          </p>
        </div>

        <figure>
          <div style={{ display: 'flex' }}>
            <img width="50%" src={course_length_pie_chart} alt="Course Length Distribution" />
            <img width="50%" src={course_levels_pie} alt="Courses per Levels" />
          </div>
          <figcaption>Distribution of Course Length and Courses per Levels</figcaption>
        </figure>

        <div className={styles.indentPars}>
          <p>There are significantly more half-year than full-year courses in the Faculty of Arts & Science.</p>
          <p>
            For the course levels, we separated them according to the first digit of the numerical part of their course
            code. There are surprisingly few 100-level courses, but it does make sense that there are lot of higher-level
            courses, as generally, first-year courses allow much larger student enrollment numbers. On the other hand,
            higher-level courses are more specialized, thus there are more of them to cover the variety of subjects that
            students can choose from.
          </p>
        </div>

        <figure>
          <img src={departments_by_hour_type} alt="Average Hours per Course by Department" />
          <figcaption>Average Hours per Course by Department</figcaption>
        </figure>

        <div className={styles.indentPars}>
          <p>
            This graph shows the average number of hours per course for each department, sorted in descending order. For
            the top 11 departments, the time is split fairly evenly between lecture and practical hours. However, it is
            clear that the majority of class time is still spent in lecture or seminar sections.
          </p>
        </div>

        <figure>
          <img src={departments_by_course_level} alt="Number of Courses by Department" />
          <figcaption>Number of Courses by Department</figcaption>
        </figure>

        <div className={styles.indentPars}>
          <p>
            The top 5 departments with the most courses are History (HIS), Religion (RLG), East Asian Studies (EAS),
            Philosophy (PHL), and Political Science (POL). There are only 13 departments with over 100 courses. For most of
            these departments, the majority of their courses are at the 300 and 400 level.
          </p>
        </div>

        <figure>
          <img src={number_of_direct_prereqs} alt="Distribution of Direct Prerequisites per Course" />
          <figcaption>Distribution of Number of Direct Prerequisites per Course</figcaption>
        </figure>

        <div className={styles.indentPars}>
          <p>
            There are 2993 courses with no direct prerequisites, and over 800 courses with 1 direct prerequisite and
            beyond. The maximum number of direct prerequisites any course has is 10 (PHY221H1).
          </p>
        </div>
      </article>
    </div>
  )
}
