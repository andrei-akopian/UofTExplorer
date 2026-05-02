"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

TODO

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

import json
import matplotlib.pyplot as plt
import seaborn as sns

try:
    from core.core import CourseGraph, Program
    from core.constructor import construct_container
    from core.algorithms import separate_courses_by_department, get_prereq_course_set
    from core.sat import solve_sat
except ImportError:
    from core import CourseGraph, Program
    from constructor import construct_container
    from algorithms import separate_courses_by_department, get_prereq_course_set
    from sat import solve_sat


COURSES_FILE = "data/courses.json"
BREADTH_NICKNAMES = ["Culture (1)", "Belief (2)", "Society (3)", "LifeSci (4)", "STEM (5)"]
SAVE_PATH = "data_analysis/images"

with open("data/glossary.json", "r") as f:
    GLOSSARY = json.load(f)


def initialize(course_file: str, program_file: str, department_file: str, breadth_file: str) -> tuple[
        CourseGraph, dict[str, Program]]:
    """
    Create a full graph and programs.
    """
    container = construct_container(course_file, program_file, department_file, breadth_file)
    return container.graph, container.programs


GRAPH, PROGRAMS = initialize(
    "data/courses.json",
    "data/programs.json",
    "data/glossary.json",
    "data/breadths.json"
)


def plot_req_counts() -> None:
    """
    Create histogram of how many backlinks prerequisites have.
    """
    req_counts = sorted([GRAPH.requisites[k].num_backlinks for k in GRAPH.requisites])
    plt.hist(req_counts[:-1], bins=50)
    plt.title("number of backlinks in requisites. (excluded backlinks=1 which is ~1750)")


def hours_per_course() -> None:
    """
    Histogram of number of total hours per course.
    """
    no_hour_courses = 0
    hour_totals = []
    for course_code in GRAPH.courses:
        course_node = GRAPH.courses[course_code]
        hours = course_node.data.hours
        total_h = sum(hours[key] for key in hours)
        hour_totals.append(total_h)
        if total_h == 0:
            no_hour_courses += 1
    plt.title(f"{no_hour_courses} courses have zero hours")
    plt.hist(hour_totals, bins=30)
    plt.savefig(
        f"{SAVE_PATH}/hours_per_course_histogram.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def course_level_pie() -> None:
    """
    Make pie chart to show proportion of 1**, 2**, 3**, 4** level courses.
    """
    collector = [0] * 6
    for _, course in GRAPH.courses.items():
        course_data = course.data
        course_number = course_data.code_split[1]
        i = min(course_number // 100, 5)
        collector[i] += 1
    plt.title("Distribution of Courses per Levels")
    plt.pie(collector[1:-1], labels=["<100", "1**", "2**", "3**", "4**", "500+"][1:-1], autopct='%1.1f%%')
    plt.savefig(
        f"{SAVE_PATH}/course_levels_pie.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def levels_in_departments() -> None:
    """
    Make bar chart, showing ditribution of different leveled courses between departments.
    """
    filetered_by_dep = separate_courses_by_department(GRAPH, departments=GLOSSARY)
    departments_with_courses = [(key, value) for key, value in filetered_by_dep.items() if len(value) != 0]

    departments_with_courses.sort(key=lambda x: len(x[1]), reverse=True)
    limit = 40

    levels_distribution_matrix = [
        [
            sum(1 for course in courses if GRAPH.courses[course].data.code_split[1] // 100 == k)
            for _, courses in departments_with_courses
        ]
        for k in range(1, 4 + 1)
    ]

    # plot the top [limit] departments and how many courses they have.
    _, ax = plt.subplots(figsize=(10, 3))
    plt.rcParams['font.size'] = 8
    ax.legend(loc='best', fontsize=5)

    running_summer = [0] * len(departments_with_courses)
    for level in range(1, 4 + 1):
        ax.bar(
            height=levels_distribution_matrix[level - 1][:limit],
            x=range(limit),
            tick_label=[entry[0] for entry in departments_with_courses][:limit],
            label=f"{level}** courses",
            bottom=running_summer[:limit]
        )
        running_summer = [running_summer[i] + levels_distribution_matrix[level - 1][i] for i in
                          range(len(running_summer))]

    ax.set_xlabel("Department")
    ax.set_ylabel("Courses")
    ax.set_title(f"Departments with most ArtSci courses ({limit}/{len(departments_with_courses)} shown)")
    ax.legend(loc='best')
    ax.tick_params(axis='both', labelsize=7, labelrotation=45)
    plt.savefig(
        f"{SAVE_PATH}/departments_by_course_level.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


# %%
def avg_hours(courses):
    total_hours = 0
    for course in courses:
        hours = GRAPH.courses[course].data.hours
        for htype in hours:
            total_hours += hours[htype]
    return total_hours / len(courses)


def hour_type_departments():
    """
    Bar chart of how time is spent in different departments' classes.
    """
    filetered_by_dep = separate_courses_by_department(GRAPH, departments=GLOSSARY)
    departments_with_courses = [
        (key, value) for key, value in filetered_by_dep.items()
        if len(value) != 0 and key != "JPM"  # exclude high outliar TODO should we really do this?
    ]
    print(f"{len(departments_with_courses)} departments have courses at artsci")

    departments_with_courses.sort(key=lambda x: avg_hours(x[1]), reverse=True)
    limit = 40

    labels = ["lecture", "tutorial", "seminar", "practical"]

    type_distribution_matrix = [
        [
            sum(GRAPH.courses[course].data.hours[t] for course in courses) / len(courses)
            for _, courses in departments_with_courses
        ]
        for t in labels
    ]

    # plot the top [limit] departments and how many courses they have.
    _, ax = plt.subplots(figsize=(10, 3))
    plt.rcParams['font.size'] = 8
    ax.legend(loc='best', fontsize=5)

    running_summer = [0] * len(departments_with_courses)
    for level in range(1, 4 + 1):
        ax.bar(
            height=type_distribution_matrix[level - 1][:limit],
            x=range(limit),
            tick_label=[entry[0] for entry in departments_with_courses][:limit],
            label=labels[level - 1],
            bottom=running_summer[:limit]
        )
        running_summer = [running_summer[i] + type_distribution_matrix[level - 1][i] for i in
                          range(len(running_summer))]

    ax.set_xlabel("Department")
    ax.set_ylabel("Hours")
    ax.set_title(f"Departments with hours ({limit}/{len(departments_with_courses)} shown)")
    ax.legend(loc='best')
    ax.tick_params(axis='both', labelsize=7, labelrotation=45)
    plt.savefig(
        f"{SAVE_PATH}/departments_by_hour_type.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def courses_per_department() -> None:
    """
    Make bar chart of the different leveld courses in different departments.
    """
    filetered_by_dep = separate_courses_by_department(GRAPH, departments=GLOSSARY)
    departments_with_courses = [(key, value) for key, value in filetered_by_dep.items() if len(value) != 0]

    departments_with_courses.sort(key=lambda x: len(x[1]), reverse=True)
    limit = 40

    # plot the top [limit] departments and how many courses they have.
    _, ax = plt.subplots(figsize=(10, 3))
    plt.rcParams['font.size'] = 8
    ax.legend(loc='best', fontsize=5)
    ax.bar([entry[0] for entry in departments_with_courses][:limit],
           [len(entry[1]) for entry in departments_with_courses][:limit])
    ax.set_xlabel("Department")
    ax.set_ylabel("Courses")
    ax.set_title(f"Departments with most ArtSci courses ({limit}/{len(departments_with_courses)} shown)")
    plt.savefig(
        f"{SAVE_PATH}/departments_most_courses_bar_chart.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def course_length_pie_chart() -> None:
    """
    Pie chart of what proportion of courses are half or full year.
    """
    full_year = 0
    half_year = 0
    for _course_code in GRAPH.courses:
        _course_node = GRAPH.courses[_course_code]
        if _course_code[-2] == "Y":
            full_year += 1
        if _course_code[-2] == "H":
            half_year += 1

    plt.pie([full_year, half_year], labels=["Full Year", "Half year"], autopct='%1.1f%%')
    plt.title("Percentage Half and Full year courses at UTSG")
    plt.savefig(
        f"{SAVE_PATH}/course_length_pie_chart.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


# %%
def distr_direct_prereqs() -> None:
    """

    """
    num_direct_prereqs = [len(course_node.prereqs.reqs) if course_node.prereqs is not None else 0 for course_node in
                          GRAPH.courses.values()]
    maximum = max(num_direct_prereqs)
    # print('courses with no direct prerequisites:', num_direct_prereqs.count(0))

    _, ax = plt.subplots(figsize=(5, 5))
    plt.rcParams['font.size'] = 6

    ax = sns.barplot(
        x=list(range(1, maximum + 1)),
        y=[num_direct_prereqs.count(i) for i in range(1, maximum + 1)],
        ax=ax,
        width=0.2
    )
    ax.set_xlabel("Number of Direct Prerequisites")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of Direct Prerequisites (excluding 2993 courses with no prerequisites)")
    plt.savefig(
        f"{SAVE_PATH}/number_of_direct_prereqs.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


# %%
def distr_total_prereqs() -> None:
    """

    """
    num_total_prereqs = [len(get_prereq_course_set(GRAPH, course_code)) - 1 for course_code in GRAPH.courses]
    maximum = max(num_total_prereqs)
    # print('courses with no prerequisites:', num_total_prereqs.count(0))

    _, ax = plt.subplots(figsize=(10, 5))
    plt.rcParams['font.size'] = 6

    ax = sns.barplot(
        x=range(1, maximum + 1),
        y=[num_total_prereqs.count(i) for i in range(1, maximum + 1)],
        ax=ax
    )
    ax.set_xlabel("Number of Total Prerequisites")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of Total Prerequisites (excluding 2993 courses with no prerequisites)")
    plt.savefig(
        f"{SAVE_PATH}/number_of_total_prereqs.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def breadth_count_by_program() -> None:
    """
    Make a bar plot of breadth count by program.
    """
    breadth_counts: dict[str, dict[str, int]] = {}
    for program in PROGRAMS.values():
        breadth_counts[program.code] = {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0}
        for course_code in program.graph.courses:
            course_node = program.graph.courses[course_code]
            for breadth in course_node.data.breadth:
                breadth_counts[program.code][str(breadth)] += 1

    _, ax = plt.subplots(figsize=(4, 3))
    plt.rcParams['font.size'] = 6

    breadth_span: dict[str, int] = {code: len([category for category in breadth_counts[code].values() if category > 0])
                                    for code in breadth_counts}
    # print(breadth_span)

    ax = sns.barplot(
        x=range(6),
        y=[
            len([code for code in breadth_span if breadth_span[code] == i])
            for i in range(6)
        ],
        ax=ax
    )
    ax.set_xlabel("Number of Breadths")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of Programs by Number of Covered Breadths")
    plt.savefig(
        f"{SAVE_PATH}/distribution_of_programs_by_breadth_span.svg",
        format="svg",
        bbox_inches ="tight",
        transparent = True,
    )

    _, ax = plt.subplots(figsize=(4, 3))
    plt.rcParams['font.size'] = 6

    breadth_counter = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for program in breadth_counts:
        for breadth in breadth_counts[program]:
            if breadth_counts[program][breadth] > 0:
                breadth_counter[int(breadth)] += 1
    # print(breadth_counter)

    ax.bar(
        x=range(1, len(BREADTH_NICKNAMES) + 1),
        tick_label=BREADTH_NICKNAMES,
        height=list(breadth_counter.values()),
    )
    ax.set_xlabel("Breadth Category")
    ax.set_ylabel("Count of Programs")
    ax.set_title("Distribution of Programs by Breadth Category")
    plt.savefig(
        f"{SAVE_PATH}/distribution_of_programs_by_breadth_category.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


# %%
def breadth_count_by_department() -> None:
    """

    """
    breadth_counts: dict[str, dict[str, int]] = {}
    for course_node in GRAPH.courses.values():
        department = course_node.data.code_split[0]
        if department not in breadth_counts:
            breadth_counts[department] = {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0}
        for breadth in course_node.data.breadth:
            breadth_counts[department][str(breadth)] += 1

    _, ax = plt.subplots(figsize=(4, 3))
    plt.rcParams['font.size'] = 6

    breadth_span: dict[str, int] = {code: len([category for category in breadth_counts[code].values() if category > 0])
                                    for code in breadth_counts}
    # print(breadth_span)

    ax = sns.barplot(
        x=list(range(6)),
        y=[len([code for code in breadth_span if breadth_span[code] == i]) for i in range(6)],
        ax=ax
    )
    ax.set_xlabel("Number of Breadths")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of Departments by Number of Covered Breadths")
    plt.tight_layout()
    plt.savefig(
        f"{SAVE_PATH}/distribution_of_departments_by_breadth_span.svg",
        format="svg",
        bbox_inches ="tight",
        transparent = True,
    )

    _, ax = plt.subplots(figsize=(3, 3))
    plt.rcParams['font.size'] = 6

    breadth_counter = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for department in breadth_counts:
        for breadth in breadth_counts[department]:
            if breadth_counts[department][breadth] > 0:
                breadth_counter[int(breadth)] += 1
    # print(breadth_counter)

    ax.bar(x=range(1, 6), tick_label=BREADTH_NICKNAMES, height=breadth_counter.values())
    ax.set_xlabel("Breadth Category")
    ax.set_ylabel("Count of Departments")
    ax.set_title("Distribution of Departments by Breadth Category")
    plt.savefig(
        f"{SAVE_PATH}/distribution_of_departments_by_breadth_category.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def distr_sat_length() -> None:
    """
    Make a bar plot of sat lengths.
    """
    lengths = []
    progressed = 0
    skipped = 0
    zeros = 0
    total = len(GRAPH.courses)
    for course in GRAPH.courses:
        print(f"{progressed} / {total} : {course}")
        solver = solve_sat(GRAPH, [course], [], [])
        dim = next(solver)
        if dim > 20:
            # print('skipped: too many fundamentals')
            progressed += 1
            skipped += 1
            continue
        # print('fundamental dimension: ', dim)
        sol = next(solver)
        if len(sol) == 0:
            zeros += 1
        else:
            lengths.append(len(sol))
        progressed += 1

    # print(f'skipped {skipped} / {total} courses due to too many fundamentals')
    # print(f'found solutions for {progressed - skipped} / {total} courses')
    # print(f'zero-length paths: {zeros}')

    _, ax = plt.subplots(figsize=(10, 6))
    plt.rcParams['font.size'] = 6

    ax = sns.barplot(
        x=list(range(1, max(lengths) + 1)),
        y=[lengths.count(i) for i in range(1, max(lengths) + 1)],
        ax=ax
    )
    ax.set_xlabel("Length of Shortest Prerequisite Path")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of Lengths of Shortest Prerequisite Path to Each Course "
                 f"(skipped {skipped} course queries with >20 fundamentals; hidden {zeros} courses with no paths)")
    plt.savefig(
        f"{SAVE_PATH}/distribution_of_sat_lengths.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def run_all() -> None:
    """
    Runs all the plots
    """
    hour_type_departments()
    levels_in_departments()
    course_level_pie()
    course_length_pie_chart()
    hours_per_course()
    breadth_count_by_department()
    breadth_count_by_program()
    distr_total_prereqs()
    distr_direct_prereqs()
    distr_sat_length()


if __name__ == "__main__":
    run_all()
    pass
