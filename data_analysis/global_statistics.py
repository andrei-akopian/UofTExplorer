"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

GLOBAL STATISTICS
This Python module computes static global statistics, to be displayed on the Global Statistics page.
The global statistics are saved in json format to a file.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""
import json

try:
    from core.algorithms import (get_avg_total_num_prereqs, separate_courses_by_cr_ncr_eligibility, separate_courses_by_breadth)
    from core.constructor import construct_container
except ImportError:
    from algorithms import (get_avg_total_num_prereqs, separate_courses_by_cr_ncr_eligibility, separate_courses_by_breadth)
    from constructor import construct_container


def run_global_statistics(output: str = "data/global_statistics.json") -> None:
    """
    Runs the global statistics
    """
    graph_container = construct_container(course_file='data/courses.json', program_file='data/programs.json',
                                          department_file='data/glossary.json', breadth_file='data/breadths.json')

    stats = {}

    stats["Total number of courses"] = graph_container.graph.num_courses()
    stats["Total number of requisites"] = graph_container.graph.num_requisites()

    # Filter courses by CR/NCR eligibility
    courses_filtered_by_cr_ncr = separate_courses_by_cr_ncr_eligibility(graph_container.graph)

    stats["Total number of courses eligible for CR/NCR"] = len(courses_filtered_by_cr_ncr[True])
    stats["Total number of courses not eligible for CR/NCR"] = len(courses_filtered_by_cr_ncr[False])

    # Filter courses by breadth requirement
    courses_filtered_by_breadth = separate_courses_by_breadth(graph_container.graph,
                                                              list(graph_container.breadths.keys()))

    for i in ['1', '2', '3', '4', '5']:
        # TODO: Get rid of error underline Angela
        stats[f"Total number of courses in breadth {i}"] = len(courses_filtered_by_breadth[i])

    stats["Average number of direct prerequisites"] = graph_container.graph.avg_num_direct_requisites()

    stats["Average number of total prerequisites"] = get_avg_total_num_prereqs(graph_container.graph)

    stats["Number of programs"] = len(graph_container.programs)

    stats["Number of departments"] = len(graph_container.departments)

    with open(output, 'w') as json_file:
        json.dump(stats, json_file, indent=4)


if __name__ == '__main__':
    run_global_statistics()

