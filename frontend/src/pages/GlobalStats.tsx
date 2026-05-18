import { Link } from 'react-router-dom'

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

const styleIndentPars = 'my-6 mx-0 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed'

function genericFigure(src: string, caption: string) {
  return (
    <figure className="mx-auto my-6 text-center">
      <img className="w-full h-auto mx-auto" src={src} alt={caption} />
      <figcaption className="text-center italic mt-2 text-slate-600">{caption}</figcaption>
    </figure>
  )
}

function doubleFigure(src1: string, caption1: string, src2: string, caption2: string) {
  return (
    <figure className="mx-auto my-6 text-center">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <img className="h-auto mx-auto" width="50%" src={src1} alt={caption1} />
        <img className="h-auto mx-auto" width="50%" src={src2} alt={caption2} />
      </div>
      <figcaption className="text-center italic mt-2 text-slate-600">
        {caption1} and {caption2}
      </figcaption>
    </figure>
  )
}

export default function GlobalStats() {
  return (
    <div className='flex justify-center h-screen'>
    <div className="max-w-[80ch] mx-auto py-8 px-4">
      <article className="text-slate-900">
        <div className="text-center text-lg mb-6">
          <Link to="/" className="text-blue-700 hover:text-blue-900">
            Home
          </Link>{' '}
          |{' '}
          <Link to="/2dgraph" className="text-blue-700 hover:text-blue-900">
            2D Graph
          </Link>{' '}
          |{' '}
          <Link to="/3dforcegraph" className="text-blue-700 hover:text-blue-900">
            3D Graph
          </Link>{' '}
          |{' '}
          <Link to="/pathexplorer" className="text-blue-700 hover:text-blue-900">
            Path Explorer
          </Link>
        </div>

        <h1 className="text-center text-3xl font-semibold">Executive Report on the Global Statistics</h1>

        <div className="text-center italic my-6 text-slate-600">
          Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng <br />March 30, 2026
        </div>

        <div className="italic my-6 p-4 bg-slate-100 border-l-4 border-blue-700 rounded-md text-slate-800">
          We explored the relationships between courses, programs, and departments at the Faculty of Arts & Science at
          the University of Toronto. This report summarizes the global statistics computed on our entire constructed graph.
          All data was pulled from the{' '}
          <a href="https://artsci.calendar.utoronto.ca/" target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900">
            Arts & Science Academic Calendar
          </a>
          .
        </div>

        <h2 className="text-2xl font-semibold">Statistics</h2>

        <div>We computed many statistical measures, with the following being done on the entire constructed graph.</div>

        <div className="mt-4 mb-6 overflow-x-auto">
          <caption className="block text-left mb-2 text-sm text-slate-700">
            <span className="font-semibold">Table 1. </span>Statistics computed on the entire graph.
          </caption>
          <table className="min-w-full border-separate border-spacing-0 border-t border-b border-slate-300">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-900 bg-slate-50">Statistic</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-900 bg-slate-50">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-white even:bg-slate-50">
                <td className="px-3 py-2 border-b border-slate-200">Total Courses</td>
                <td className="px-3 py-2 border-b border-slate-200">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styleIndentPars}>
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

        {doubleFigure(course_length_pie_chart, 'Course Length Distribution', course_levels_pie, 'Courses per Levels')}

        <div className={styleIndentPars}>
          <p>There are significantly more half-year than full-year courses in the Faculty of Arts & Science.</p>
          <p>
            For the course levels, we separated them according to the first digit of the numerical part of their course
            code. There are surprisingly few 100-level courses, but it does make sense that there are lot of higher-level
            courses, as generally, first-year courses allow much larger student enrollment numbers. On the other hand,
            higher-level courses are more specialized, thus there are more of them to cover the variety of subjects that
            students can choose from.
          </p>
        </div>

        {genericFigure(departments_by_hour_type, 'Average Hours per Course by Department')}

        <div className={styleIndentPars}>
          <p>
            This graph shows the average number of hours per course for each department, sorted in descending order. For
            the top 11 departments, the time is split fairly evenly between lecture and practical hours. However, it is
            clear that the majority of class time is still spent in lecture or seminar sections.
          </p>
        </div>

        {genericFigure(departments_by_course_level, 'Number of Courses by Department')}

        <div className={styleIndentPars}>
          <p>
            The top 5 departments with the most courses are History (HIS), Religion (RLG), East Asian Studies (EAS),
            Philosophy (PHL), and Political Science (POL). There are only 13 departments with over 100 courses. For most of
            these departments, the majority of their courses are at the 300 and 400 level.
          </p>
        </div>

        {genericFigure(number_of_direct_prereqs, 'Distribution of Direct Prerequisites per Course')}

        <div className={styleIndentPars}>
          <p>
            There are 2993 courses with no direct prerequisites, and over 800 courses with 1 direct prerequisite and
            beyond. The maximum number of direct prerequisites any course has is 10 (PHY221H1).
          </p>
        </div>
      </article>
    </div>
    </div>
  )
}
