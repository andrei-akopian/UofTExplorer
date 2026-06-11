from core.algorithms import get_prereq_course_set
import matplotlib.pyplot as plt

SAVE_PATH = None
GRAPH = None


def distr_direct_prereqs() -> None:
    """ """
    num_direct_prereqs = [
        len(course_node.prereqs.reqs) if course_node.prereqs is not None else 0
        for course_node in GRAPH.courses.values()
    ]
    maximum = max(num_direct_prereqs)
    # print('courses with no direct prerequisites:', num_direct_prereqs.count(0))

    _, ax = plt.subplots(figsize=(5, 5))
    plt.rcParams["font.size"] = 6

    ax.bar(
        x=list(range(0, maximum + 1)),
        height=[num_direct_prereqs.count(i) for i in range(0, maximum + 1)],
    )
    ax.set_xlabel("Number of Direct Prerequisites")
    ax.set_yscale("log")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of Direct Prerequisites")
    plt.savefig(
        f"{SAVE_PATH}/number_of_direct_prereqs.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def distr_total_prereqs() -> None:
    """ """
    num_total_prereqs = [
        len(get_prereq_course_set(GRAPH, course_code)) - 1
        for course_code in GRAPH.courses
    ]
    maximum = max(num_total_prereqs)
    # print('courses with no prerequisites:', num_total_prereqs.count(0))

    _, ax = plt.subplots(figsize=(10, 5))
    plt.rcParams["font.size"] = 6

    ax.bar(
        x=range(0, maximum + 1),
        height=[num_total_prereqs.count(i) for i in range(0, maximum + 1)],
    )
    ax.set_xlabel("Number of Total Prerequisites")
    ax.set_yscale("log")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of Total Prerequisites")
    plt.savefig(
        f"{SAVE_PATH}/number_of_total_prereqs.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )
