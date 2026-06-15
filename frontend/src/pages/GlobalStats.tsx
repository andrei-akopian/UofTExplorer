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
import HelpMenu from "../components/HelpMenu";

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
          <h1 className="mt-4 mb-4 text-center text-2xl font-semibold sm:mt-6 sm:text-3xl">
            Executive Report on Global Statistics at the University of Toronto
          </h1>

          <div>
            We explored the relationships between courses, programs, and
            departments at the Unversity of Toronto's Faculty of Arts & Science.
            Our findings are summarized in this report! All data was pulled from
            the{" "}
            <a
              href="https://artsci.calendar.utoronto.ca/"
              target="_blank"
              rel="noreferrer"
              className="text-link hover:text-link-hover"
            >
              Arts & Science Academic Calendar
            </a>
            .
          </div>

          <h2 className="mt-6 mb-2 text-xl font-semibold sm:text-2xl">
            Statistics
          </h2>

          <GlobalStatsTable />

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              As a note, the value listed for the total number of requisites is
              less than the actual total number of prerequisites that each
              course has. This is because we chose to optimize memory by storing
              only one copy of every unique Requisite object.
            </p>
            <p>
              Direct prerequisites are defined as the number of CourseNode or
              Requisite objects that are listed as the prerequisites of a
              course. The average number of direct prerequisites is below 1, an
              indication that the majority of courses do not have any direct
              prerequisites.
            </p>
            <p>
              Total prerequisites are defined as any course located in the
              Requisite tree downstream from the prerequisites of a CourseNode.
              Thus, upper year courses with long chains of prerequisites will
              have a higher number of total prerequisites. While many courses do
              not have prerequisites, there are enough courses with a large
              numbers of prerequisites, bringing the average past 4.
            </p>
            <p>
              Finally, the Faculty of Arts & Science has many programs and
              departments that span various subject areas. However, it is
              unlikely that the number of programs is less than the number of
              departments doubled. This is likely because the glossary of
              departments that we scraped comprised some departments from other
              UofT faculties, inflating the total number of departments.
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
              Regarding course levels, we separated them by the first digit of
              their course code's numerical component. There are surprisingly
              few 100-level courses. On the other hand, the high number of upper
              year courses makes sense; first-year courses allow larger student
              enrollment numbers due to being more general, while upper year
              courses are smaller and more specialized.
            </p>
          </div>

          {genericFigure(
            departments_by_hour_type,
            "Average Hours per Course by Department",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              For the top 12 departments, a good portion of hours are spent in
              practicals. Overall, it is clear that the majority of class time
              is spent in lecture or seminar sections.
            </p>
          </div>

          {genericFigure(
            departments_by_course_level,
            "Number of Courses by Department",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              The 5 departments with the most courses are History (HIS),
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
              only having 0-2 direct prerequisites.
            </p>
          </div>

          {genericFigure(
            number_of_total_prereqs,
            "Distribution of Number of Total Prerequisites per Course",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Interestingly, when considering any course that is part of the
              prerequisite tree, the vast majority of courses only have 0-2.
              This means students are able to take a wide variety of courses.
            </p>
          </div>

          {genericFigure(
            distribution_of_programs_by_breadth_category,
            "Distribution of Programs by Breadth Category",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Although breadth 1 has the second highest number of courses, it
              has the lowest number of programs. The other four breadth
              categories kept their relative orderings for the number of courses
              and number of programs.
            </p>
          </div>

          {genericFigure(
            distribution_of_programs_by_breadth_span,
            "Distribution of Programs by Breadth Span",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Many programs span 3+ breadth categories. The courses that are not
              in any breadth category are special courses, such as ROP courses.
            </p>
          </div>

          {genericFigure(
            distribution_of_departments_by_breadth_category,
            "Distribution of Departments by Breadth Category",
          )}

          <div className="mx-0 my-6 [&_p]:my-4 [&_p]:text-justify [&_p]:leading-relaxed">
            <p>
              Note that the sum of Figure 8's bars is greater than the total
              number of departments. This is because for course in a department
              that covers a breadth category, we added 1 to the count.
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
              For Figure 10, we used our Requisite Satisfiability Affirmation
              (RSA) algorithm to compute the shortest prerequisite path length
              for each course.
            </p>
            <p>
              Since a lot of courses have 0-1 prerequisites, 800+ courses have a
              shortest path length of 1. Overall, the sharp decrease in shortest
              path length shows that courses in the Faculty of Arts & Science
              generally do not require many prerequisites.
            </p>
          </div>

          <h2 className="mt-6 mb-2 text-xl font-semibold sm:text-2xl">
            Discussion
          </h2>

          <Theorem>Kimchi.</Theorem>

          <div className="proof">Trivial. (See Figure 11 for evidence.)</div>

          {genericFigure(kimchi, "Kimchi the cat.")}
        </article>
      </div>
      <div className="absolute top-20 right-8 z-100">
        <HelpMenu>Global Stats Help Placeholder</HelpMenu>
      </div>
    </div>
  );
}
