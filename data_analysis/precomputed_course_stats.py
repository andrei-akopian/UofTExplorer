import collections
from core.constructor import construct_course_graph, construct_disjoint_subgraphs
from core.traversers import Targets, _catch_name_code, _update_queue
from core.core import *
import logging

TRAVERSER_TARGETS = Targets(True, True, False, True)


def get_subgraph_sizes(data) -> dict[str, int]:
    graph = construct_course_graph(filename="", data=data)
    subgraphs = construct_disjoint_subgraphs(graph, TRAVERSER_TARGETS)
    table = dict()
    for subgraph in subgraphs:
        subgraph_size = len(subgraph)
        for course in subgraph.courses:
            table[course] = subgraph_size
    return table
