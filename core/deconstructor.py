"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

DECONSTRUCTOR
This Python module provides deconstructor functions that turn CourseGraph objects into json files, to be used for
visualizations.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

import json

from typing import Callable
from coloraide import Color

from core.constructor import construct_course_graph
from core.core import CourseGraph, CourseNode, Requisite


def deconstruct_course_graph(
    course_graph: CourseGraph,
    filtered_courses: dict[str, CourseNode] = None,
    special_courses: dict[str, CourseNode] = None,
    breadths: dict[str, str] = None,
) -> dict[str, list[dict]]:
    """
    Return a dictionary of course nodes, logic gate AND/OR nodes, and graph edges to be passed into a json file and
    used for visualized course graphs, as well as their layout, labels, and colours.

    >>> course_graph = construct_course_graph('data/courses.json')
    >>> course_graph_dicts = deconstruct_course_graph(course_graph)
    >>> {"id": "LIN200H1", "label": "LIN200H1", "title": "Introduction to Language", "depth": 2.0, \
    "color": "#93c9cc"} in course_graph_dicts["nodes"]
    True
    >>> {'id': '1,ECO204Y1,ECO206Y1', 'label': 'OR', 'title': '', 'depth': None, 'shape': 'box', 'color': '#BBBBBB'} \
    in course_graph_dicts["nodes"]
    True
    >>> {'from': 'CHM326H1', 'to': '2,CHM326H1,CHM328H1', 'color': '#CCCCCC'} in course_graph_dicts["edges"]
    True
    """
    if filtered_courses is None:
        filtered_courses = {}
    if special_courses is None:
        special_courses = {}
    if breadths is None:
        breadths = {}

    # Maybe should be renamed b/c logic-gate nodes also are added to this dictionary?
    json_courses = []  # List of dictionaries for each course and each AND/OR node
    json_edges = []  # List of dictionaries for each edge
    logic_gate_dict = {}  # Dictionary of dictionaries for each AND/OR node

    # Read colours
    colours_dict = read_colours("data/colours.json")
    colour_line = Color.interpolate(
        colours_dict["base"],
        space="srgb",
    )

    # Create dictionaries for each course
    for course_code, course in course_graph.courses.items():
        course_number: int = int(course.split_code()[1])
        depth = course_number / 100
        json_course = {
            "id": course_code,
            "label": course_code,
            "code": course_code,
            "title": course.data.title,
            "depth": depth,
            "description": course.data.description,
            "crNcr": course.data.cr_ncr,
            "breadth": ", ".join(
                f"{breadths[str(br)]}" if str(br) in breadths else str(br)
                for br in course.data.breadth
                if course.data.breadth[br] != 0
            )
            or None,
            "prerequisites": course.data.original_requisite_strings.get(
                "prerequisites"
            )[14:]
            or None,
            "corequisites": course.data.original_requisite_strings.get("corequisites")[
                13:
            ]
            or None,
            "exclusions": course.data.original_requisite_strings.get("exclusions")[11:]
            or None,
            "previousCourseCodes": course.data.previous_course_codes or None,
            # FIXME, make better default behavior here
            "class_size": [course.data.class_size, 30][course.data.class_size is None],
        }

        # Set the colour of the course
        if course_code in filtered_courses:
            json_course["color"] = colours_dict["filtered"].to_string(
                hex=True, upper=True, alpha=False
            )
        elif course_code in special_courses:
            json_course["color"] = colours_dict["special"].to_string(
                hex=True, upper=True, alpha=False
            )
        else:
            json_course["color"] = colour_line((depth - 1) / 3).to_string(
                hex=True, upper=True, alpha=False
            )

        json_courses.append(json_course)

    # Create dictionaries for each AND/OR node
    for course in course_graph.courses:
        prereqs = course_graph.courses[course].prereqs
        # No AND/OR nodes when course has no prerequisites
        if prereqs is None:
            continue
        # No AND/OR nodes when course has only 1 prerequisite
        elif (
            all(isinstance(prereq, CourseNode) for prereq in prereqs.reqs)
            and len(prereqs.reqs) == 1
        ):
            continue
        # Create dicionaries representing the AND/OR nodes belonging to a course
        else:
            create_logic_gate_nodes(prereqs, logic_gate_dict)

    # Add the dictionaries representing AND/OR nodes to the list of course dictionaries
    for key in logic_gate_dict:
        json_courses.append(logic_gate_dict[key])

    # Create dictionaries representing graph edges
    for course in course_graph.courses:
        if (
            course_graph.courses[course].prereqs is not None
        ):  # Edges exist when course has prerequisites
            deconstruct_prerequisites(
                course,
                course_graph.courses[course].prereqs,
                logic_gate_dict,
                json_edges,
            )

    return {"nodes": json_courses, "edges": json_edges}


def create_logic_gate_nodes(
    prereqs: Requisite, logic_gate_dict: dict[str, dict]
) -> None:
    """
    Recursively create dictionaries representing AND/OR nodes for the course graph.
    """
    req_id = str(prereqs)  # id of the AND/OR node is the Requisite hash
    # Ensure no duplicate AND/OR nodes for a specific subgraph of prerequisites is created
    if req_id not in logic_gate_dict:
        if len(prereqs.reqs) == prereqs.degree:
            node = {
                "id": req_id,
                "label": "AND",
                "title": "",
                "depth": None,
                "shape": "box",
                "color": "#BBBBBB",
            }
        else:
            node = {
                "id": req_id,
                "label": "OR",
                "title": "",
                "depth": None,
                "shape": "box",
                "color": "#BBBBBB",
            }
        logic_gate_dict[req_id] = node

    # Recursively create more AND/OR node(s)
    if any(isinstance(p, Requisite) for p in prereqs.reqs):
        for prereq in prereqs.reqs:
            if isinstance(prereq, Requisite):
                create_logic_gate_nodes(prereq, logic_gate_dict)


def deconstruct_prerequisites(
    node: str,
    prereqs: Requisite,
    logic_gate_dict: dict[str, dict],
    json_edges: list[dict],
) -> None:
    """
    Recursively creates dictionaries representing graph edges. Edges can exist between 2 course nodes, between 2
    AND/OR nodes, and between a course node and an AND/OR node.
    """
    # If the prerequisite is just one course, simply add an edge to that course
    if all(isinstance(p, CourseNode) for p in prereqs.reqs) and len(prereqs.reqs) == 1:
        json_edge = {"from": prereqs.reqs[0].code, "to": node, "color": "#CCCCCC"}
        json_edges.append(json_edge)
        return

    # Otherwise, we have to add edges to the AND/OR nodes
    else:
        # Find the id of the AND/OR node that is the child of the current node
        logic_gate_node_id = ""
        for key in logic_gate_dict:
            if logic_gate_dict[key]["id"] == str(prereqs):
                logic_gate_node_id = logic_gate_dict[key]["id"]
                json_edge = {"from": logic_gate_node_id, "to": node, "color": "#CCCCCC"}
                json_edges.append(json_edge)
                break

        # Make prerequisite course nodes and necessary AND/OR nodes the children of the current AND/OR node
        # and the grandchildren of the current course node
        for prereq in prereqs.reqs:
            if isinstance(prereq, CourseNode):
                json_edge = {
                    "from": prereq.code,
                    "to": logic_gate_node_id,
                    "color": "#CCCCCC",
                }
                json_edges.append(json_edge)
            # Recurse to construct an edge between the current AND/OR node and it's child AND/OR node
            else:
                deconstruct_prerequisites(
                    logic_gate_node_id, prereq, logic_gate_dict, json_edges
                )

        return


def read_colours(file_path: str) -> dict[str, Color | list[Color]]:
    """
    Return a dictionary mapping breadth codes to their corresponding colours.
    """
    colours_dict = {}

    with open(file_path, "r") as f:
        for k, v in json.load(f).items():
            if isinstance(v, list):
                colours_dict[k] = [Color(col) for col in v]
            else:
                colours_dict[k] = Color(v)

    return colours_dict


if __name__ == "__main__":
    pass
    # import doctest

    # doctest.testmod(verbose=True)

    # import python_ta

    # python_ta.check_all(
    #     config={
    #         "allow-local-imports": True,
    #         "extra-imports": [],
    #         "allowed-io": [],
    #         "max-line-length": 120,
    #         "max-nested-blocks": 5,
    #         "max-locals": 20,
    #         "max-branches": 15,
    #         "max-args": 7,
    #     }
    # )
