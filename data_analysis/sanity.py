"""
Data Check for special conditions in the graph
"""

import collections
from core.constructor import construct_course_graph, construct_disjoint_subgraphs
from core.traversers import Targets, _catch_name_code, _update_queue
from core.core import *
import logging


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s: %(message)s",
        handlers=[
            logging.FileHandler("data_analysis/sanity_report.log", mode="w"),
            logging.StreamHandler(),
        ],
    )


def cycle_checker(
    graph: CourseGraph, origin: str | CourseNode, targets: Targets
) -> bool:
    """
    Check whether it contains a cycle. adapted from standard bfs traverser.
    """

    visited: set[str] = {"None"}
    queue = collections.deque()

    # populate visited and queue by the initial origins of BFS
    origin = _catch_name_code(graph, origin)
    queue.append(origin)
    debounce = False

    while queue:
        curr = queue.popleft()
        if debounce:
            if curr is origin:
                return False
        else:
            debounce = True

        if isinstance(curr, CourseNode):
            # add every unvisited node connected to curr to queue
            tar = []
            if targets.prereq:
                tar.append(curr.prereqs)
            if targets.coreq:
                tar.append(curr.coreqs)
            if targets.excl:
                tar.append(curr.exclusions)
            _update_queue(queue, visited, tar)
            if targets.postreq:
                _update_queue(queue, visited, list(curr.postreqs.values()))

        elif isinstance(curr, Requisite):
            if targets.prereq or targets.coreq or targets.excl:
                # add all unvisited nodes connected to curr to queue
                for req in curr.reqs:
                    if str(req) not in visited:
                        visited.add(str(req))
                        queue.append(req)

            if targets.postreq:
                for req in curr.postreqs:
                    if req not in visited:
                        visited.add(req)
                        req_obj = None
                        if req in graph.courses:
                            req_obj = graph.courses[req]
                        elif req in graph.requisites:
                            req_obj = graph.requisites[req]
                        queue.append(req_obj)

        else:
            print(f"UNRESOLVED TRAVERSAL NODE: {curr} {type(curr)}")
            break

    return True


def nsquare_cyclechecker(graph=None):
    setup_logging()
    if graph is None:
        graph = construct_course_graph("data/courses.json")
    subgraphs = construct_disjoint_subgraphs(graph)
    targets = Targets(prereq=True, coreq=False, excl=False, postreq=False)
    logging.info(f"Cycle Checker: Scanning {len(subgraphs)} subgraphs.")
    for subgraph in subgraphs:
        for o in subgraph.courses:
            has_cycle = cycle_checker(graph, o, targets)
            if not has_cycle:
                logging.critical(
                    f"subgraph with {len(subgraph.courses)} courses has a cycle. (representative: {o})"
                )
                break
    logging.info(f"Cycle Checker: No other cycles found.")


if __name__ == "__main__":
    nsquare_cyclechecker()
