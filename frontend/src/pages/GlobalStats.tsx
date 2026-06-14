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
      <img
        className="bg-page-bg-light mx-auto h-auto w-full rounded-md"
        src={src}
        alt={caption}
      />
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
      <div className="bg-page-bg-light flex flex-col gap-4 md:flex-row md:gap-6">
        <img
          className="mx-auto h-auto w-full rounded-md md:w-1/2"
          src={src1}
          alt={caption1}
        />
        <img
          className="mx-auto h-auto w-full rounded-md md:w-1/2"
          src={src2}
          alt={caption2}
        />
      </div>
      <figcaption className="mt-2 ml-0 w-full px-1 pt-1 text-center italic before:font-bold before:not-italic before:[content:'Figure_'counter(figcaption)'._']">
        {caption1} and {caption2}
      </figcaption>
    </figure>
  );
}

export default function GlobalStats() {
  return (
    <div className="bg-page-bg text-text-body flex min-h-screen justify-center overflow-y-auto font-serif">
      <div className="w-full min-w-0 px-4 py-6 sm:mx-auto sm:max-w-[80ch] sm:px-6 sm:py-8">
        <article className="leading-6 [counter-reset:theorem_figcaption_tablecaption] sm:leading-7">
          <h1 className="mt-4 mb-2 text-center text-2xl font-semibold sm:mt-6 sm:text-3xl">
            Executive Report on Global Statistics at the University of Toronto
          </h1>

          <div className="my-6 text-center italic">
            Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng <br />
          </div>

          <div>
            We explored the relationships between courses, programs, and
            departments at the Faculty of Arts & Science at the University of
            Toronto. All data was pulled from the{" "}
            <a
              href="https://artsci.calendar.utoronto.ca/"
              target="_blank"
              rel="noreferrer"
              className="text-link hover:text-link-hover"
            >
              Arts & Science Academic Calendar
            </a>
            . This report summarizes our findings!
          </div>

          <h2 className="mt-6 mb-2 text-xl font-semibold sm:text-2xl">
            Statistics
          </h2>

          <GlobalStatsTable />

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Note that the number of requisites is the total number of
              Requisite objects stored by the complete CourseGraph, which
              undercounts the real number of prerequisites required by all
              courses due to our memory optimization of only keeping one copy of
              each unique Requisite object.
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
              For the top 11 departments, the time is split fairly evenly
              between lecture and practical hours. Overall, it's clear that the
              majority of class time is spent in lecture or seminar sections.
            </p>
          </div>

          {genericFigure(
            departments_by_course_level,
            "Number of Courses by Department",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              The top 5 departments with the most courses are History (HIS),
              Political Science (POL), Philosophy (PHL), English (ENG), and
              Religion (RLG).
            </p>
          </div>

          {genericFigure(
            number_of_direct_prereqs,
            "Distribution of Direct Prerequisites per Course",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Many courses on the Academic Calendar are part of a simple
              sequence of courses (i.e. Course A to Course B to Course C), thus
              only requiring 1 or 2 direct prerequisites.
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
              in any breadth category are special courses, such as ROP courses.
            </p>
          </div>

          {genericFigure(
            distribution_of_departments_by_breadth_category,
            "Distribution of Departments by Breadth Category",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              We went through each department and added 1 to each breadth
              category that the department has at least 1 course in, which is
              why the sum of the bars in the graph is higher than the total
              number of departments.
            </p>
          </div>

          {genericFigure(
            distribution_of_departments_by_breadth_span,
            "Distribution of Departments by Breadth Span",
          )}

          {genericFigure(
            distribution_of_sat_lengths,
            "Distribution of Satisfying Requisite Path Lengths",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              For this, we used our Requisite Satisfiability Affirmation (RSA)
              algorithm to compute the shortest prerequisite path length for
              each course. In order to reduce the computation time to a few
              minutes, any courses with over 20 fundamentals were skipped.
            </p>
            <p>
              Again, since a lot of courses have zero or one prerequisites, over
              800 courses have a shortest path length of 1. Overall, the quick
              decay in shortest path length shows that courses in the Faculty of
              Arts and Science generally do not require many prerequisites.
            </p>
          </div>

          <h2 className="mt-6 mb-2 text-xl font-semibold sm:text-2xl">
            Discussion
          </h2>

          <Theorem>Kimchi.</Theorem>

          <div className="proof">
            Trivial. (See <a href="#figure-kimchi">Figure 11</a> for evidence.)
          </div>

          {genericFigure(kimchi, "Kimchi the cat.")}
        </article>
      </div>
    </div>
  );
}
