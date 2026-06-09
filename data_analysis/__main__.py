from .sanity import cycle_checker
from core.constructor import construct_course_graph, construct_disjoint_subgraphs
from core.traversers import Targets
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def main():
    graph = construct_course_graph("data/courses.json")
    subgraphs = construct_disjoint_subgraphs(graph)
    targets = Targets(prereq=True, coreq=False, excl=False, postreq=False)
    print(f"Scanning {len(subgraphs)} subgraphs.")
    for subgraph in subgraphs:
        for o in subgraph.courses:
            has_cycle = cycle_checker(graph, o, targets)
            if not has_cycle:
                logger.critical(
                    f"subgraph with {len(subgraph.courses)} courses has a cycle. (representative: {o})"
                )
                break


if __name__ == "__main__":
    main()
