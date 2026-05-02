"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

TRAVERSERS
This Python module contains the breadth-first-search generator function for traversing through the CourseGraph.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

from __future__ import annotations
import collections
from typing import Generator, Any
from dataclasses import dataclass

from core.core import CourseGraph, CourseNode, Requisite


def bfs_generator(graph: CourseGraph, origins: list[str | CourseNode | Requisite], targets: Targets,
                  representation: str = 'string', max_depth: int = -10)\
        -> Generator[tuple[CourseNode | Requisite | str, str, int], Any, Any]:
    """
    A generator function that traverses along all directions (targets) in breadth-first order,
    starting from the origins.

    Yields a tuple containing:
        - current node in representation type
        - class of current node: "course" or "requisite"
        - distance of current node to the closest origin of traversal

    Optional Arguments:
        - representation: either 'string' or 'node' for the type of data the function yields.
        - depth: the max depth to explore from origin. Default value for no limit.
    """

    # breadth-first-search utilities
    visited: set[str] = {'None'}
    queue = collections.deque()

    # populate visited and queue by the initial origins of BFS
    for origin in origins:
        origin_obj = _catch_name_code(graph, origin)  # turn possible str input into node object
        if origin_obj:
            visited.add(str(origin_obj))
            queue.append(origin_obj)

    queue.append(0)  # adding the first sentinel value, the depth increament flag
    curr_depth = 0

    while queue:
        curr = queue.popleft()
        if curr == 0:
            curr_depth += 1
            if curr_depth == max_depth + 1:  # max depth reached
                break
            if len(queue) <= 0:  # no more nodes to traverse to
                break
            queue.append(0)
            continue

        if isinstance(curr, CourseNode):
            # add every unvisited node connected to curr to queue, only in directions specified by targets
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

            # yields in the requested type
            if representation == 'node':
                yield curr, 'course', curr_depth
            else:
                yield str(curr), 'course', curr_depth

        elif isinstance(curr, Requisite):

            if targets.prereq or targets.coreq or targets.excl:
                # add all unvisited reqs connected to curr to queue
                for req in curr.reqs:
                    if str(req) not in visited:
                        visited.add(str(req))
                        queue.append(req)

            if targets.postreq:
                # add all unvisited reqs connected to curr to queue
                for req in curr.postreqs:
                    if req not in visited:
                        visited.add(req)
                        req_obj = None
                        if req in graph.courses:
                            req_obj = graph.courses[req]
                        elif req in graph.requisites:
                            req_obj = graph.requisites[req]
                        queue.append(req_obj)

            # yields in the requested type
            if representation == 'node':
                yield curr, 'requisite', curr_depth
            else:
                yield str(curr), 'requisite', curr_depth

        else:
            print(f'UNRESOLVED TRAVERSAL NODE: {curr} {type(curr)}')
            break

    yield "", "", -1  # end of traversal
    return None


@dataclass
class Targets:
    """
    Target configuration dataclass for bfs traversals.
    Configures which type of neighbours can be traversed to.

    Instance Attributes:
        - prereq: whether the traverser will visit prerequisites
        - coreq: whether the traverser will visit corequisites
        - excl: whether the traverser will visit exclusions
        - postreq: whether the traverser will visit post-requisites
    """
    prereq: bool
    coreq: bool
    excl: bool
    postreq: bool


def _catch_name_code(graph: CourseGraph, name: str | CourseNode | Requisite) -> CourseNode | Requisite | None:
    """
    A helper function that returns the input, name, if it is already a node object.
    Otherwise, return the node object associated with the name in graph.

    Return None if the input does not exist in graph.
    """
    if isinstance(name, CourseNode):
        return name

    if isinstance(name, Requisite):
        return name

    if name in graph.courses:
        return graph.courses[name]

    if name in graph.requisites:
        return graph.requisites[name]

    return None


def _update_queue(queue: collections.deque, visited: set[str], nodes: list) -> None:
    """
    Helper for BFS traversal loop code.
    Mutates queue and visited appropriately for each node (CourseNode, Requisite) object in nodes.
    """
    for node in nodes:
        node_str = str(node)
        if node_str not in visited:
            visited.add(node_str)
            queue.append(node)


if __name__ == '__main__':
    # import doctest
    # doctest.testmod(verbose=True)

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': ['collections', 'typing'],
        'allowed-io': ['bfs_prereq', 'bfs_all', 'bfs_generator'],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 20,
        'max-branches': 15,
        'max-args': 7
    })
