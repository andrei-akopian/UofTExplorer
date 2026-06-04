import type { ReactNode } from "react";

import course_length_pie_chart from "../assets/globalstats/course_length_pie_chart.svg";
import course_levels_pie from "../assets/globalstats/course_levels_pie.svg";
import departments_by_course_level from "../assets/globalstats/departments_by_course_level.svg";
import departments_by_hour_type from "../assets/globalstats/departments_by_hour_type.svg";
import distribution_of_departments_by_breadth_category from "../assets/globalstats/distribution_of_departments_by_breadth_category.svg";
import distribution_of_departments_by_breadth_span from "../assets/globalstats/distribution_of_departments_by_breadth_span.svg";
import distribution_of_programs_by_breadth_category from "../assets/globalstats/distribution_of_programs_by_breadth_category.svg";
import distribution_of_programs_by_breadth_span from "../assets/globalstats/distribution_of_programs_by_breadth_span.svg";
import distribution_of_sat_lengths from "../assets/globalstats/distribution_of_sat_lengths.svg";
import number_of_direct_prereqs from "../assets/globalstats/number_of_direct_prereqs.svg";
import number_of_total_prereqs from "../assets/globalstats/number_of_total_prereqs.svg";
import kimchi from "../assets/globalstats/kimchi.jpg";

import GlobalStatsTable from "../components/GlobalStatsTable";

type TheoremProps = {
  children: ReactNode;
  className?: string;
};

function Theorem({ children, className = "" }: TheoremProps) {
  return (
    <div
      className={`my-3 block italic [counter-increment:theorem] before:mr-1 before:font-bold before:not-italic before:[content:'Theorem_'counter(theorem)'.'] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function genericFigure(src: string, caption: string) {
  return (
    <figure className="mx-auto my-6 text-center [counter-increment:figcaption]">
      <img className="mx-auto h-auto w-full" src={src} alt={caption} />
      <figcaption className="mt-2 ml-0 w-full px-1 pt-1 text-center italic before:font-bold before:not-italic before:[content:'Figure_'counter(figcaption)'._']">
        {caption}
      </figcaption>
    </figure>
  );
}

function doubleFigure(
  src1: string,
  caption1: string,
  src2: string,
  caption2: string,
) {
  return (
    <figure className="mx-auto my-6 text-center [counter-increment:figcaption]">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <img className="mx-auto h-auto" width="50%" src={src1} alt={caption1} />
        <img className="mx-auto h-auto" width="50%" src={src2} alt={caption2} />
      </div>
      <figcaption className="mt-2 ml-0 w-full px-1 pt-1 text-center italic before:font-bold before:not-italic before:[content:'Figure_'counter(figcaption)'._']">
        {caption1} and {caption2}
      </figcaption>
    </figure>
  );
}

export default function GlobalStats() {
  return (
    <div className="flex min-h-screen justify-center overflow-y-auto font-serif">
      <div className="mx-auto max-w-[80ch] px-4 py-8">
        <article className="leading-7 [counter-reset:theorem_figcaption_tablecaption]">
          <h1 className="mt-6 mb-2 text-center text-3xl font-semibold">
            Executive Report on the Global Statistics
          </h1>

          <div className="my-6 text-center italic">
            Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng <br />
            March 30, 2026
          </div>

          <div className="my-6 rounded-md border-l-4 border-blue-700 bg-slate-100 p-4 text-slate-800 italic">
            We explored the relationships between courses, programs, and
            departments at the Faculty of Arts & Science at the University of
            Toronto. This report summarizes the global statistics computed on
            our entire constructed graph. All data was pulled from the{" "}
            <a
              href="https://artsci.calendar.utoronto.ca/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:text-blue-900"
            >
              Arts & Science Academic Calendar
            </a>
            .
          </div>

          <h2 className="mt-6 mb-2 text-2xl font-semibold">Statistics</h2>

          <div>
            We computed many statistical measures, with the following being done
            on the entire constructed graph.
          </div>

          <GlobalStatsTable />

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              We can see that the Faculty of Arts & Science has a significant
              number of courses. Note that the number of requisites is the total
              number of Requisite objects stored by the complete CourseGraph,
              which undercounts the real number of prerequisites required by all
              courses due to our memory optimization of only keeping one copy of
              each unique Requisite object.
            </p>
            <p>
              The majority of courses are eligible for CR/NCR, but around
              one-fifth of the courses are not eligible.
            </p>
            <p>
              The distribution of courses across Breadth Requirement categories
              is less uniform than we expected. It is interesting that Breadth 1
              and Breadth 3 each have roughly double the amount of courses
              compared to Breadth 2, Breadth 4, and Breadth 5.
            </p>
            <p>
              Direct prerequisites are defined as the number of CourseNode or
              Requisite objects located directly in the prerequisites of a
              course. The average number of direct prerequisites being below 1
              indicates that the majority of courses do not have any
              prerequisites.
            </p>
            <p>
              Total prerequisites are defined as any course that is located in
              the Requisite tree downstream from the prerequisites of a
              CourseNode. Thus, higher-year courses with long chains of
              prerequisites will have a higher number of total prerequisites.
              While many courses do not have any prerequisites, there are enough
              courses with large numbers of prerequisites to bring the average
              up to 3.
            </p>
            <p>
              Finally, the Faculty of Arts & Science has a large number of
              programs and departments that span a variety of subject areas. It
              seems unlikely, though, that the number of programs is less than
              double the number of departments. The cause of this is likely that
              the glossary of departments that we scraped included some
              departments from other faculties at UofT, inflating the total
              number of departments.
            </p>
          </div>

          {doubleFigure(
            course_length_pie_chart,
            "Course Length Distribution",
            course_levels_pie,
            "Courses per Levels",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              There are significantly more half-year than full-year courses in
              the Faculty of Arts & Science.
            </p>
            <p>
              For the course levels, we separated them according to the first
              digit of the numerical part of their course code. There are
              surprisingly few 100-level courses, but it does make sense that
              there are lot of higher-level courses, as generally, first-year
              courses allow much larger student enrollment numbers. On the other
              hand, higher-level courses are more specialized, thus there are
              more of them to cover the variety of subjects that students can
              choose from.
            </p>
          </div>

          {genericFigure(
            departments_by_hour_type,
            "Average Hours per Course by Department",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              This graph shows the average number of hours per course for each
              department, sorted in descending order. For the top 11
              departments, the time is split fairly evenly between lecture and
              practical hours. However, it is clear that the majority of class
              time is still spent in lecture or seminar sections.
            </p>
          </div>

          {genericFigure(
            departments_by_course_level,
            "Number of Courses by Department",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              The top 5 departments with the most courses are History (HIS),
              Religion (RLG), East Asian Studies (EAS), Philosophy (PHL), and
              Political Science (POL). There are only 13 departments with over
              100 courses. For most of these departments, the majority of their
              courses are at the 300 and 400 level.
            </p>
          </div>

          {genericFigure(
            number_of_direct_prereqs,
            "Distribution of Direct Prerequisites per Course",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              There are 2993 courses with no direct prerequisites, and over 800
              courses with 1 direct prerequisite and 2 direct prerequisites
              respectively. Then, it falls dramatically, with less than 400
              having 3 direct prerequisites and less than 200 with 4 direct
              prerequisites.
            </p>
            <p>
              This is likely due to the way that course prerequisites are
              generally written on the Academic Calendar. Many courses are part
              of a simple sequence of courses (i.e. Course A to Course B to
              Course C), thus only requiring 1 or 2 direct prerequisites.
            </p>
          </div>

          {genericFigure(
            number_of_total_prereqs,
            "Distribution of Number of Total Prerequisites per Course",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Interestingly, when considering total prerequisites (counting any
              course that is part of the prerequisite tree), the vast majority
              of courses still only have 1 or 2 total prerequisites, meaning
              students have the ability to take a wide variety of courses.
            </p>
          </div>

          {genericFigure(
            distribution_of_programs_by_breadth_category,
            "Distribution of Programs by Breadth Category",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Although Breadth 1 has the second highest number of courses, it
              has the lowest number of programs. The other four Breadth
              categories have kept their relative orderings between number of
              courses and number of programs.
            </p>
          </div>

          {genericFigure(
            distribution_of_programs_by_breadth_span,
            "Distribution of Programs by Breadth Span",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              We iterated over the programs and computed how many breadth
              categories are spanned by their courses. The courses that are not
              in any breadth category are special courses, for example ROP
              courses.
            </p>
          </div>

          {genericFigure(
            distribution_of_departments_by_breadth_category,
            "Distribution of Departments by Breadth Category",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              For this graph, we went through each department and added 1 to
              each breadth category that the department has at least 1 course
              in, which is why the sum of the bars in the graph is higher than
              the total number of departments.
            </p>
            <p>
              Breadth 3 courses appear in a lot of departments, while Breadth 4
              has comparatively a lot lower number of departments.
            </p>
          </div>

          {genericFigure(
            distribution_of_departments_by_breadth_span,
            "Distribution of Departments by Breadth Span",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              As expected, the vast majority of departments only contain courses
              that span 1 breadth category. However, there is a significant
              number of departments that span 2 and 3 breadth categories.
            </p>
          </div>

          {genericFigure(
            distribution_of_sat_lengths,
            "Distribution of Satisfying Requisite Path Lengths",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              For this, we used the Reverse SAT algorithm to compute the
              shortest prerequisite path length for each course. In order to
              reduce the computation time to a few minutes, any courses with
              over 20 fundamentals were skipped.
            </p>
            <p>
              Again, since a lot of courses have zero or one prerequisites, over
              800 courses have a shortest path length of 1. Overall, the quick
              decay in shortest path length shows that courses in the Faculty of
              Arts and Science generally do not require many prerequisites.
            </p>
          </div>

          <h2 className="mt-6 mb-2 text-2xl font-semibold">Discussion</h2>

          <Theorem>Kimchi.</Theorem>

          <div className="proof">
            Trivial. (See <a href="#figure-kimchi">Figure 11</a> for evidence.)
          </div>

          {genericFigure(
            kimchi,
            "Kimchi the cat. Source: Jasmine Chen's camera roll.",
          )}
        </article>
      </div>
    </div>
  );
}
