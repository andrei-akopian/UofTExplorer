"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

CONSTRUCTOR
This Python module provides constructor functions to construct graphs from json file data.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

import os
import json
from typing import Any, Optional
from core.core import CourseGraphContainer, CourseGraph, CourseNode, CourseData, Requisite, Program
import core.traversers as traversers


def construct_container(course_file: str, program_file: str, department_file: str, breadth_file: str)\
        -> CourseGraphContainer:
    """
    Return a CourseGraphContainer containing the constructed CourseGraph, programs, departments, and breadths,
    using the given file names.

    Preconditions:
        - course_file, program_file, department_file, and breadth_file are the names of files that contain json data
            in a valid format

    >>> graph_container = construct_container(course_file='data/courses.json', program_file='data/programs.json', \
                                          department_file='data/glossary.json', breadth_file='data/breadths.json')
    >>> isinstance(graph_container.graph, CourseGraph)
    True
    >>> len(graph_container.programs)
    385
    >>> len(graph_container.departments)
    235
    """
    graph = construct_course_graph(course_file)
    programs = construct_programs(graph, program_file)
    departments = construct_departments(department_file)
    bind_postreqs(graph)
    bind_programs(programs)

    with open(breadth_file) as f:
        breadths = json.load(f)

    # TODO: THESE BREAK THE VISUALIZER - angela
    # bind_postreqs(graph)
    # bind_programs(programs)

    return CourseGraphContainer(graph, programs, departments, breadths)


def construct_course_graph(filename: str) -> CourseGraph:
    """
    Return a graph of courses and requisites based on the given data in the json file.

    Preconditions:
        - filename is the file name of a json file in the correct format

    >>> course_graph = construct_course_graph('data/courses.json')
    >>> course_graph.num_courses() == 5345
    True
    >>> course_graph.num_requisites() == 2107
    True

    >>> MAT237Y1 = course_graph.courses['MAT237Y1']
    >>> MAT237Y1.data.title
    'Multivariable Calculus with Proofs'
    >>> MAT237Y1.data.hours == {"lecture": 72, "tutorial": 0, "practical": 0, "seminar": 0}
    True
    >>> MAT237Y1.data.breadth.keys()
    dict_keys(['5'])
    >>> MAT237Y1_prereq_hash = str(MAT237Y1.prereqs)
    >>> MAT237Y1_prereq_hash == '2,(1,MAT137Y1,MAT157Y1,(2,(1,MAT133Y1,(2,MAT135H1,MAT136H1)),' \
    '(1,MAT138H1,MAT246H1))),(1,MAT223H1,MAT240H1)'
    True
    """
    # Load all the course data from the json file
    if not os.path.isfile(filename):
        raise FileNotFoundError(f"{filename} not found, unable to construct graph")
    with open(filename) as f:
        data = json.load(f)

    courses_dict = {}  # Dictionary of course nodes
    for course in data:  # Iterate over each course from the json file
        # Get data for course hours
        hours = {}
        for key in course['hours']:
            hours[key] = course['hours'][key]

        # Get data for breadth
        breadth = {}
        course_code = course["course_code"]
        split_course_code = course["split_course_code"]

        # Get data for credit value
        credit_value = 1 if split_course_code[3] == "H" else 2
        breadth_value = 0
        breadth_count = len(course['breadth_requirements_list'])
        if breadth_count > 0:
            breadth_value = credit_value // breadth_count
        for br in course['breadth_requirements_list']:
            breadth[br[-2]] = breadth_value

        # Create course data object
        course_data = CourseData(
            code_split=split_course_code,
            title=course["title"],
            description=course["description"],
            cr_ncr=course["cr_ncr_eligible"],
            hours=hours,
            breadth=breadth,
            original_requisite_strings={
                "prerequisites": course["prerequisites_original"],
                "corequisites": course["corequisites_original"],
                "exclusions": course["exclusions_original"],
            }
        )

        # Add to the course dictionary
        courses_dict[course_code] = CourseNode(code=course_code, data=course_data)

    # Key-value pairs of requisite hashes and their requisites
    requisites_dict = {}

    # Construct requisites for each course
    for course_entry in data:
        construct_requisites(course_entry, courses_dict, requisites_dict)

    # Create graph and return
    course_graph = CourseGraph(courses=courses_dict, requisites=requisites_dict)
    return course_graph


def construct_requisites(
    course_entry: dict[str, Any],
    courses_dict: dict[str, CourseNode],
    requisites_dict: dict[str, Requisite],
) -> None:
    """
    Construct the requisites of a course, for which the json data is given.
    Add the parsed Requisite object to requisites_dict.

    courses_dict contains courses, with the keys being the course codes and the values being CourseNode objects
    requisites_dict contains requisites, with the keys being requisite hashes and the values being Requisite objects

    The CourseNode object in courses_dict corresponding to the course_data is modified with its prerequisites,
        corequisites, and exclusions.

    NOTE: In order to optimize memory, all CourseNode and Requisite objects are stored in courses_dict and
        requisites_dict respectively. This prevents any duplicate objects from being stored.
    Thus, Requisite objects (which can recursively contain other Requisite objects, as well as CourseNode objects)
        point to Requisite objects and/or CourseNode objects that are also in requisites_dict or courses_dict.

    Preconditions:
        - course_entry is in a valid format
        - course_entry["course_code"] in courses_dict
    """
    # Get CourseNode for the current course
    course = courses_dict[course_entry["course_code"]]

    # Construct the prerequisites
    prerequisites_data = course_entry["prerequisites"]
    prerequisites_obj = construct_requisites_helper(
        prerequisites_data, courses_dict, requisites_dict
    )
    if prerequisites_obj:
        prerequisites_obj.increment_num_backlinks()

    # Construct the corequisites
    corequisites_data = course_entry["corequisites"]
    corequisites_obj = construct_requisites_helper(
        corequisites_data, courses_dict, requisites_dict
    )
    if corequisites_obj:
        corequisites_obj.increment_num_backlinks()

    # Construct the exclusions
    exclusions_data = course_entry["exclusions"]
    exclusions_obj = construct_requisites_helper(
        exclusions_data, courses_dict, requisites_dict
    )
    if exclusions_obj:
        exclusions_obj.increment_num_backlinks()

    # Add requisites to the CourseNode
    course.prereqs = prerequisites_obj
    course.coreqs = corequisites_obj
    course.exclusions = exclusions_obj


def construct_requisites_helper(
    requisites_list: list[str | list],
    courses_dict: dict[str, CourseNode],
    requisites_dict: dict[str, Requisite],
) -> Optional[Requisite]:
    """
    Recursively construct the requisite data from requisites_list, a list whose first element denotes the logic type and
    whose other elements contain course codes or a nested requisites_list.

    Return the Requisite object corresponding to the data and add the returned object to requisites_dict.
    Return None if requisites_list is empty.

    NOTE: In order to optimize memory, all CourseNode and Requisite objects are stored in courses_dict and
    requisites_dict respectively. This prevents any duplicate objects from being stored.
    Thus, Requisite objects (which can recursively contain other Requisite objects, as well as CourseNode objects)
    point to Requisite objects and/or CourseNode objects that are also in requisites_dict or courses_dict.

    Preconditions:
        - requisites_list[0] == 'AND' or requisites_list[0] == 'OR'
        - requisites_list is in a valid format
    """
    if len(requisites_list) == 0:
        return None

    requisites_obj = Requisite()

    # Remove first element which indicates the type of logic
    requisites_list_copy = requisites_list.copy()
    logic_type = requisites_list_copy.pop(0)

    # (1) Get the logic type ('AND' or 'OR') and set the degree accordingly
    if logic_type == "AND":
        requisites_obj.degree = len(requisites_list_copy)
    else:
        requisites_obj.degree = 1

    # (2) Iterate through the nested list of courses/requisites
    for requisite in requisites_list_copy:

        # If it is a singular course, add it to the Requisite object
        if isinstance(requisite, str):

            # If the course is not already in courses_dict, initialize a new CourseNode and add it
            if requisite not in courses_dict:
                print(f"WARNING: Nonexisting Course: {requisite}")
                courses_dict[requisite] = CourseNode(
                    code=requisite,
                    data=CourseData(
                        title="", description="", cr_ncr=False, hours={}, breadth={}
                    ),
                )
            # Append this course to the Requisite object
            requisites_obj.add_requisite(courses_dict[requisite])

        # Otherwise, it needs to be parsed into a Requisite object
        else:
            # Recursively call this function
            sub_requisites_obj = construct_requisites_helper(requisite, courses_dict, requisites_dict)

            # Add this sub-requisite to the current Requisite object
            requisites_obj.add_requisite(sub_requisites_obj)
            sub_requisites_obj.increment_num_backlinks()

    # (3) If current Requisite object is already in requisites_dict, then use that one instead
    if str(requisites_obj) in requisites_dict:
        requisites_obj = requisites_dict[str(requisites_obj)]

    # Otherwise, add current Requisite object to requisites_dict
    else:
        requisites_dict[str(requisites_obj)] = requisites_obj

    # Finally, return this Requisite object
    return requisites_obj


def construct_programs(total_graph: CourseGraph, programs_file: str) -> dict[str, Program]:
    """
    Constructs all the programs in programs_file, in the domain of total_graph.
    Each Program object is effectively a subgraph of total_graph.

    Returns a mapping from each program code to its Program object.
    """
    programs = {}

    with open(programs_file, 'r') as f:
        data = json.load(f)
        for entry in data:
            code = "".join(entry['program_code'])
            title = entry['title']
            mentions = entry['courses_mentioned']
            program = construct_program(total_graph, mentions, code, title)
            programs[code] = program

    return programs


def construct_program(total_graph: CourseGraph, courses: list[str], code: str, title: str) -> Program:
    """
    Return a Program object that contains the given courses, including the courses' prerequisites and corequisites.
    """
    subgraph = construct_subgraph(total_graph, courses, traversers.Targets(True, True, False, False))
    return Program(code=code, title=title, graph=subgraph)


def construct_subgraph(total_graph: CourseGraph, courses: list[str], directions: Optional[traversers.Targets] = None) \
        -> CourseGraph:
    """
    Return a subgraph of all related nodes of courses in the courses list.

    A node is considered to be related if they are connected through requisites in total_graph.
    Directions limits the directions of traversal to consider when determining related nodes.
    If None, then all directions.
    """
    if directions is None:
        directions = traversers.Targets(True, True, True, True)

    v_courses = {}
    v_reqs = {}

    # Traverse through graph nodes
    bfs = traversers.bfs_generator(graph=total_graph, origins=courses, representation='node',
                                   targets=directions)
    curr, curr_t, _ = next(bfs)

    while curr:
        if curr_t == 'course':
            v_courses[str(curr)] = curr
        elif curr_t == 'requisite':
            v_reqs[str(curr)] = curr
        else:
            print("INVALID TRAVERSAL RETURN TYPE")
        curr, curr_t, _ = next(bfs)

    subgraph = CourseGraph(v_courses, v_reqs)
    return subgraph


def construct_departments(department_file: str) -> dict[str, str]:
    """
    Return a dictionary mapping department codes to department names.
    """
    with open(department_file) as f:
        return json.load(f)


def bind_postreqs(graph: CourseGraph) -> None:
    """
    Populate the postreqs fields of all CourseNode and Requisite objects in the graph.
    """
    # Add postreqs to courses
    for course_code in graph.courses:
        course = graph.courses[course_code]
        if course.prereqs:
            course.prereqs.postreqs[course_code] = course

    # Add postreqs to requisites
    for req_name in graph.requisites:
        requisite = graph.requisites[req_name]
        for req in requisite.reqs:
            req.postreqs[req_name] = requisite


def bind_programs(programs: dict[str, Program]) -> None:
    """
    Add each Program in programs to the program_backlinks of courses it is relevant to.
    """
    for program_code in programs:
        program = programs[program_code]
        for course in program.graph.courses:
            program.graph.courses[course].program_backlinks[program_code] = program


if __name__ == '__main__':
    import doctest
    doctest.testmod(verbose=True)

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': ['json', 'os'],
        'allowed-io': ['construct_course_graph', 'construct_programs', 'construct_program',
                       'construct_requisites_helper', 'construct_container', 'construct_subgraph',
                       'construct_departments'],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 20,
        'max-branches': 15,
        'max-args': 7
    })

    # TODO: remove these
    X = construct_course_graph('data/courses.json')
    Y = construct_programs(X, 'data/programs.json')
    bind_postreqs(X)
    bind_programs(Y)
