from core import sat
from core.sat_solvers import z3wrapper
from core.constructor import construct_container, construct_subgraph
from core.algorithms import (get_course_suggestions, get_filtered_graph, get_search_suggestions, traversers)
from core.deconstructor import deconstruct_course_graph

DATA_FOLDER = "./data"
COURSE_GRAPH_CONTAINER = construct_container(f"{DATA_FOLDER}/courses.json",
                                             f"{DATA_FOLDER}/programs.json",
                                             f"{DATA_FOLDER}/glossary.json",
                                             f"{DATA_FOLDER}/breadths.json")

course = COURSE_GRAPH_CONTAINER.graph.courses["CSC466H1"]
print(course)

solver = sat.solve_sat(COURSE_GRAPH_CONTAINER.graph, ["CSC466H1"], [], [])
print("Solutions")
for s in solver:
    if isinstance(s, list):
        for c in s:
            print(c)


print("Z3")
solver = z3wrapper.solve_sat(COURSE_GRAPH_CONTAINER.graph, ["CSC466H1"])
print(solver)
 