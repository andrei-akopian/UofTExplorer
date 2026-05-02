"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

ALGORITHMS
This Python module contains top-level algorithms for the core graph structures.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""
from core.constructor import construct_container, construct_course_graph, construct_subgraph, bind_postreqs, bind_programs
from core.core import CourseGraphContainer, CourseGraph, CourseNode
import core.traversers as traversers
from core.deconstructor import deconstruct_course_graph


def get_avg_total_num_prereqs(graph: CourseGraph) -> float:
    """
    Return the average total number of prerequisites in the course graph. The total number of prequisites is defined as
    all descendant nodes of a course.

    >>> course_graph = construct_course_graph('data/courses.json')
    >>> round(get_avg_total_num_prereqs(course_graph), 2)
    3.56
    """
    num_total_reqs = []
    for course in graph.courses:
        num = len(get_prereq_course_set(graph=graph, origin=course)) - 1
        num_total_reqs.append(num)

    return round(sum(num_total_reqs) / len(num_total_reqs), 2)


def separate_courses_by_cr_ncr_eligibility(graph: CourseGraph) -> list[dict[str, CourseNode]]:
    """
    Return a list of length 2, where:
        the first element is a dictionary (mapping course codes to CourseNode objects) of filtered courses in graph
            that are eligible for CR/NCR, and
        the second element is a dictionary (mapping course codes to CourseNode objects) of filtered courses in graph
            that are not eligible for CR/NCR.

    >>> course_graph = construct_course_graph('data/courses.json')
    >>> courses_filtered_by_cr_ncr = separate_courses_by_cr_ncr_eligibility(course_graph)
    >>> 'CSC148H1' in courses_filtered_by_cr_ncr[True]
    True
    >>> 'VIC189H1' in courses_filtered_by_cr_ncr[False]
    True
    """
    return graph.get_filtered_courses(
        [lambda course: course.is_cr_ncr(True), lambda course: course.is_cr_ncr(False)],
        [True, False]
    )


def separate_courses_by_breadth(graph: CourseGraph, breadth_categories: list[str]) -> list[dict[str, CourseNode]]:
    """
    Return a list of length 5, where each element is a dictionary (mapping course codes to CourseNode objects) of
    filtered courses that are counted under that breadth requirement.

    >>> graph_container = construct_container(course_file='data/courses.json', \
    program_file='data/programs.json', department_file='data/glossary.json', breadth_file='data/breadths.json')
    >>> courses_seperated_by_breadth = separate_courses_by_breadth(graph_container.graph, \
    list(graph_container.breadths.keys()))
    >>> 'ENG252H1' in courses_seperated_by_breadth['1']
    True
    >>> 'PHL245H1' in courses_seperated_by_breadth['2']
    True
    >>> 'ECO101H1' in courses_seperated_by_breadth['3']
    True
    >>> 'BIO120H1' in courses_seperated_by_breadth['4']
    True
    >>> 'MAT135H1' in courses_seperated_by_breadth['5']
    True
    """
    return graph.get_filtered_courses(
        # Must pass in breadth as a default argument to the lambdas so that its value is stored during each loop
        # iteration, otherwise the value gets looked up at runtime and only uses the last value in breadth_categories
        [lambda course, b=breadth: course.is_in_breadth(b) for breadth in breadth_categories],
        breadth_categories
    )


def separate_courses_by_department(graph: CourseGraph, departments: dict[str, str])\
        -> dict[str, dict[str, CourseNode]]:
    """
    Return a dictionary mapping department codes to the dictionary mapping course codes to CourseNode objects which are
    part of that department.

    departments is a dictionary mapping department codes to anything; the values in the dictionary are not used

    >>> graph_container = construct_container(course_file='data/courses.json', \
    program_file='data/programs.json', department_file='data/glossary.json', breadth_file='data/breadths.json')
    >>> courses_seperated_by_department = separate_courses_by_department(graph_container.graph, \
    graph_container.departments)
    >>> 'MAT137Y1' in courses_seperated_by_department['MAT']
    True
    >>> 'CLA204H1' in courses_seperated_by_department['CLA']
    True
    >>> 'CSC111H1' in courses_seperated_by_department['CIV']
    False
    """
    # Must pass in dept as a default argument to the lambdas so that its value is stored during each loop iteration,
    # otherwise the value gets looked up at runtime and only uses the last value in departments
    conditions = [lambda course, d=dept_code: course.is_in_department(d) for dept_code in departments]

    # Turn departments from a dict into a string
    departments_list = list(departments.keys())

    # TODO: figure out how to get rid of this error (it works, it's just mad that the return type annotation for
    # TODO: graph.get_filtered_courses has Hashable while this function returns str)
    return graph.get_filtered_courses(conditions, departments_list)


def get_prereq_course_set(graph: CourseGraph, origin: str | CourseNode, max_depth: int = -10) -> set[str]:
    """
    Returns the set of course codes of courses that are descendant prereqs of input origin,
    including the input origin, with a maximum search depth of max_depth.

    >>> course_graph = construct_course_graph('data/courses.json')
    >>> prereq_set = get_prereq_course_set(course_graph, 'MAT257Y1', 2)
    >>> prereq_set == {'MAT157Y1', 'MAT247H1', 'MAT257Y1'}
    True
    """
    bfs = traversers.bfs_generator(graph=graph, origins=[origin], max_depth=max_depth,
                                   targets=traversers.Targets(True, False, False, False))

    result = set()
    curr, curr_t, _ = next(bfs)
    while curr:
        if curr_t == "course":
            result.add(curr)

        curr, curr_t, _ = next(bfs)

    return result


def get_postreq_course_set(graph: CourseGraph, origins: list[str | CourseNode]) -> set[str]:
    """
    Returns a set of the name codes of all the postreqs to the courses in origins.

    >>> course_graph = construct_course_graph('data/courses.json')
    >>> bind_postreqs(course_graph)
    >>> postreq_set = get_postreq_course_set(course_graph, ['MUS111H1'])
    >>> postreq_set == {'MST326H1', 'MUS111H1'}
    True
    """
    postreqs = set()
    bfs = traversers.bfs_generator(graph=graph, origins=origins,
                                   targets=traversers.Targets(False, False, False, True))
    curr, curr_t, _ = next(bfs)
    while curr:
        if curr_t == 'course':
            postreqs.add(str(curr))
        curr, curr_t, _ = next(bfs)

    return postreqs


def get_precoreq_course_set(graph: CourseGraph, origins: list[str | CourseNode]) -> set[str]:
    """
    Returns a set of the name codes of all prereqs and coreqs to the courses in origins.

    >>> course_graph = construct_course_graph('data/courses.json')
    >>> precoreqs = get_precoreq_course_set(course_graph, ['CSC148H1'])
    >>> precoreqs == {'CSC148H1', 'CSC108H1'}
    True
    """
    precos = set()
    bfs = traversers.bfs_generator(graph=graph, origins=origins,
                                   targets=traversers.Targets(True, True, False, False))
    curr, curr_t, _ = next(bfs)
    while curr:
        if curr_t == 'course':
            precos.add(str(curr))
        curr, curr_t, _ = next(bfs)

    return precos


def get_parent_program_set(courses: list[CourseNode]) -> set[str]:
    """
    Returns the union of the sets of the names of the programs the courses belong to.

    >>> graph_container = construct_container(course_file='data/courses.json', \
    program_file='data/programs.json', department_file='data/glossary.json', breadth_file='data/breadths.json')
    >>> bind_programs(graph_container.programs)
    >>> parent_program_set = get_parent_program_set([graph_container.graph.courses['PHY407H1'], \
    graph_container.graph.courses['ENG286H1']])
    >>> parent_program_set == {'ASSPE2737', 'ASSPE2738', 'ASMAJ0525', 'ASSPE1944', 'ASMIN1944', 'ASMAJ1645', \
    'ASSPE1645', 'ASSPE1758', 'ASSPE0525', 'ASSPE0271', 'ASMIN0160', 'ASSPE2739', 'ASSPE1073', 'ASMAJ1423', \
    'ASMAJ1944', 'ASSPE2740'}
    True
    """
    union = set()
    for course in courses:
        for program in course.program_backlinks:
            union.add(program)

    return union


def get_filtered_graph(container: CourseGraphContainer, query: str, filters: dict[str, list[str]])\
        -> dict[str, list | str]:
    """
    Return the deconstructed, filtered graph based on the given container, search query, and filters.
    This function is case-insensitive to query.

    Preconditions:
        - key in {'cr_ncr', 'departments', 'breadth'} for key in filters
        - isinstance(filters['cr_ncr'], list[str])
        - isinstance(filters['departments'], list[str])
        - isinstance(filters['breadth'], list[str])
    """
    query_lower = query.lower()
    query_upper = query.upper()
    special_courses: dict[str, CourseNode] = {}
    graph_data: dict = {}

    # Get the full graph
    if query_lower in ["all", "full"]:
        subgraph = container.graph
        graph_data["search"] = "all"
        graph_data["curr_query"] = {"type": "all", "code": "", "name": ""}

    elif query_upper in container.departments:
        subgraph = construct_subgraph(
            container.graph,
            list(container.graph.get_filtered_courses([
                lambda course: course.is_in_department(query_upper)
            ])[0]),
            traversers.Targets(True, True, False, False)
        )
        graph_data["search"] = query_upper
        graph_data["curr_query"] = {"type": "department", "code": query_upper,
                                    "name": "Department of " + container.departments[query_upper]}

        if all(filters[key] == [] for key in filters):
            filters["departments"].append(query_upper)

    # Get the graph for the program being searched for
    elif query_upper in container.programs:
        subgraph = container.programs[query_upper].graph
        graph_data["search"] = query_upper
        graph_data["curr_query"] = {"type": "program", "code": query_upper,
                                    "name": container.programs[query_upper].title}

    # Get the graph for the course being searched for
    # Includes the course's prerequisites
    elif query_upper in container.graph.courses:
        subgraph = construct_subgraph(container.graph, [query_upper],
                                      traversers.Targets(True, True, False, False))
        graph_data["search"] = query_upper
        graph_data["curr_query"] = {"type": "course", "code": query_upper,
                                    "name": container.graph.courses[query_upper].data.title}
        special_courses[query_upper] = container.graph.courses[query_upper]

    # Otherwise, the query is invalid
    else:  # TODO improve this error handling, so frontend get 400 response codes
        raise ValueError("query value has no corresponding graph to display")

    # Apply filters

    # If the filters are empty, pass in an empty dictionary of filtered courses
    if all(filters[key] == [] for key in filters):
        filtered_courses = {}

    # Otherwise, filter the courses in the subgraph
    else:
        filtered_courses = subgraph.get_filtered_courses(
            [
                lambda course: all([
                    filters['cr_ncr'] == []
                    or any(course.matches_cr_ncr(elig) for elig in filters['cr_ncr']),
                    filters['departments'] == []
                    or any(course.is_in_department(dept) for dept in filters['departments']),
                    filters['breadth'] == []
                    or any(course.is_in_breadth(breadth) for breadth in filters['breadth'])
                ])
            ]
        )[0]

    # Deconstruct the subgraph
    graph_data.update(deconstruct_course_graph(subgraph, filtered_courses, special_courses))

    live_stats = compute_live_statistics(subgraph, container)
    graph_data["live_stats"] = live_stats

    assert "edges" in graph_data
    assert "nodes" in graph_data
    assert "curr_query" in graph_data
    assert "live_stats" in graph_data

    return graph_data


def get_search_suggestions(container: CourseGraphContainer, query: str, max_results: dict[str, int])\
        -> list[dict[str, str]]:
    """
    Return search suggestions for the given search query to be displayed as search suggestions.

    The suggestions are in the order of department(s), program(s), course(s) (first courses whose course code contains
        query, then courses whose course name contains query).
    The number of returned suggestions in each category is constrained by max_results.

    Preconditions:
        - all(key in {"departments", "programs", "courses"} for key in max_results)
    """
    matches = []

    if query in "ALL":
        matches.append(
            {"code": "all", "title": "Display All Courses", "num_prereqs": ""}
        )
    if query in "FULL":
        matches.append(
            {"code": "full", "title": "Display All Courses", "num_prereqs": ""}
        )

    # Search for departments that contain query in its code or title
    department_matches = get_department_suggestions(container, query)
    matches.extend(department_matches)

    # Search for programs that contain query in its program code or program title
    program_matches = get_program_suggestions(container, query)

    # Search for courses that contain query in its course code or course title
    course_matches = get_course_suggestions(container, query)

    # Check the length of the program and course matches
    # We always want to show the maximum total results with max_results["programs"] and max_results["courses"] satisfied

    # If both are shorter than the maximum, show them all
    if len(program_matches) <= max_results["programs"] and len(course_matches) <= max_results["courses"]:
        matches.extend(program_matches + course_matches)

    # If program matches is shorter than maximum, show extra courses
    elif len(program_matches) <= max_results["programs"]:
        matches.extend(program_matches
                       + course_matches[:max_results["courses"] + (max_results["programs"] - len(program_matches))])

    # If course matches is shorter than maximum, show extra programs
    elif len(course_matches) <= max_results["courses"]:
        matches.extend(program_matches[:max_results["programs"] + (max_results["courses"] - len(course_matches))]
                       + course_matches)

    # Otherwise, both are longer than maximum, so limit both
    else:
        matches.extend(program_matches[:max_results["programs"]] + course_matches[:max_results["courses"]])

    return matches


def get_department_suggestions(container: CourseGraphContainer, query: str) -> list[dict[str, str]]:
    """
    Get search suggestions for matching departments for the given query.
    Includes departments that contain the query in its three-letter code or name.
    """
    department_matches = []
    for dept_code, dept_name in container.departments.items():
        if query.upper() in {dept_code, dept_name.upper()}:
            department_matches.append({"code": dept_code,
                                       "title": "Department of " + dept_name,
                                       "num_prereqs": ""})

    return department_matches


def get_program_suggestions(container: CourseGraphContainer, query: str) -> list[dict[str, str]]:
    """
    Get search suggestions for matching programs for the given query.
    Includes programs that contain the query in its code or name.
    """
    filtered_programs = container.get_filtered_programs(
        lambda program_obj: program_obj.code_contains(query) or program_obj.title_contains(query))

    # Add the filtered programs to the list of matches
    program_matches = []
    for program in filtered_programs:
        program_matches.append({"code": program.code,
                                "title": program.title,
                                "num_prereqs": ""})

    return program_matches


def get_course_suggestions(container: CourseGraphContainer, query: str) -> list[dict[str, str]]:
    """
    Get search suggestions for matching courses for the given query.
    Includes courses that contain the query in its code or name.
    """
    # Search for courses that contain query in its course code
    filtered_courses = container.graph.get_filtered_courses(
        [lambda course_obj: course_obj.code_contains(query),
         lambda course_obj: course_obj.title_contains(query)]
    )

    # Add the filtered courses that contain query in their course code to the list of matches
    course_matches = []
    for course in filtered_courses[0]:
        if filtered_courses[0][course].prereqs is not None:
            num_prereqs = str(len(filtered_courses[0][course].prereqs))
        else:
            num_prereqs = ""

        course_matches.append({"code": filtered_courses[0][course].code,
                               "title": filtered_courses[0][course].data.title,
                               "num_prereqs": num_prereqs})

    # Add the filtered courses that contain query in their course title to the list of matches
    for course in filtered_courses[1]:
        if filtered_courses[1][course].prereqs is not None:
            num_prereqs = str(len(filtered_courses[1][course].prereqs))
        else:
            num_prereqs = ""

        course_matches.append({"code": filtered_courses[1][course].code,
                               "title": filtered_courses[1][course].data.title,
                               "num_prereqs": num_prereqs})

    return course_matches


def compute_live_statistics(graph: CourseGraph, graph_container: CourseGraphContainer) -> dict[str, str | int]:
    """
    Return a dictionary of live course, program, and department statistics to be visually
    displayed to the user.

    Uses the departments, programs, and breadth categories from graph_container.
    """
    stats = {}

    stats["Number of courses"] = graph.num_courses()
    stats["Number of requisites"] = graph.num_requisites()

    # Filter courses by CR/NCR eligibility
    courses_filtered_by_cr_ncr = separate_courses_by_cr_ncr_eligibility(graph)

    stats["Number of courses eligible for CR/NCR"] = len(courses_filtered_by_cr_ncr[True])
    stats["Number of courses not eligible for CR/NCR"] = len(courses_filtered_by_cr_ncr[False])

    # Filter courses by breadth requirement
    courses_filtered_by_breadth = separate_courses_by_breadth(graph,
                                                              list(graph_container.breadths.keys()))

    for i in ['1', '2', '3', '4', '5']:
        stats[f"Number of courses in breadth {i}"] = len(courses_filtered_by_breadth[i])

    return stats


if __name__ == '__main__':
    # pass
    import doctest
    doctest.testmod(verbose=True)

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': [],
        'allowed-io': [],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 20,
        'max-branches': 15,
        'max-args': 7
    })
