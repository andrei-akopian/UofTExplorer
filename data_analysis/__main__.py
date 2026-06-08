from .sanity import cycle_checker
from core.constructor import construct_course_graph, construct_disjoint_subgraphs
from core.traversers import Targets


def main():
    graph = construct_course_graph("data/courses.json")
    subgraphs = construct_disjoint_subgraphs(graph)
    print(subgraphs)
    # targets = Targets(prereq=True, coreq=False, excl=False, postreq=)
    # print(cycle_checker(graph, , targets))


if __name__ == "__main__":
    main()
