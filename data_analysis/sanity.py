"""
Data Check for special conditions in the graph
"""

import collections

try:
    import core.constructor as constructor
    from core.traversers import Targets, _catch_name_code, _update_queue
    from core.core import *
except ImportError:
    import constructor
    from traversers import Targets, _catch_name_code, _update_queue
    from core import *


def cycle_checker(graph: CourseGraph, origin: str | CourseNode, targets: Targets) -> bool:
    """
    A generator function that traverses along all connections in breadth-first order, starting from the origins.
    Optional Arguments:
        - representation: either 'string' or 'node' for the type of data the function yields.
        - depth: the max depth to explore from origin. Negative values for no depth limit.
    """

    visited: set[str] = {'None'}
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
            print(f'UNRESOLVED TRAVERSAL NODE: {curr} {type(curr)}')
            break

    return True
