from core.sat import solve_sat, solve_satz3
import matplotlib.pyplot as plt

SAVE_PATH = None
GRAPH = None


def distr_sat_lengthz3() -> None:
    """
    Make a bar plot of sat lengths using the z3 sat solver
    """
    lengths = []
    progressed = 0
    skipped = 0
    zeros = 0
    total = len(GRAPH.courses)
    for course in GRAPH.courses:
        print(f"{progressed} / {total} : {course}")
        true_courses = solve_satz3(GRAPH, [course], [], [])
        sol = len(true_courses)
        if sol == 0:
            zeros += 1
        else:
            lengths.append(sol)
        progressed += 1

    _, ax = plt.subplots(figsize=(10, 6))
    plt.rcParams["font.size"] = 6

    ax.bar(
        x=list(range(1, max(lengths) + 1)),
        height=[lengths.count(i) for i in range(1, max(lengths) + 1)],
    )
    ax.set_xlabel("Length of Shortest Prerequisite Path")
    ax.set_yscale("log")
    ax.set_ylabel("Count")
    ax.set_title(
        "Distribution of Lengths of Shortest Prerequisite Path to Each Course."
    )
    plt.savefig(
        f"{SAVE_PATH}/distribution_of_sat_lengths.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )


def distr_sat_length(GRAPH) -> None:
    """
    Make a bar plot of sat lengths.
    """
    lengths = []
    progressed = 0
    skipped = 0
    zeros = 0
    total = len(GRAPH.courses)
    for course in GRAPH.courses:
        print(f"{progressed} / {total} : {course}")
        solver = solve_sat(GRAPH, [course], [], [])
        dim = next(solver)
        if dim > 20:
            # print('skipped: too many fundamentals')
            progressed += 1
            skipped += 1
            continue
        # print('fundamental dimension: ', dim)
        sol = next(solver)
        if len(sol) == 0:
            zeros += 1
        else:
            lengths.append(len(sol))
        progressed += 1

    # print(f'skipped {skipped} / {total} courses due to too many fundamentals')
    # print(f'found solutions for {progressed - skipped} / {total} courses')
    # print(f'zero-length paths: {zeros}')

    _, ax = plt.subplots(figsize=(10, 6))
    plt.rcParams["font.size"] = 6

    ax.bar(
        x=list(range(1, max(lengths) + 1)),
        y=[lengths.count(i) for i in range(1, max(lengths) + 1)],
    )
    ax.set_xlabel("Length of Shortest Prerequisite Path")
    ax.set_ylabel("Count")
    ax.set_title(
        "Distribution of Lengths of Shortest Prerequisite Path to Each Course "
        f"(skipped {skipped} course queries with >20 fundamentals; hidden {zeros} courses with no paths)"
    )
    plt.savefig(
        f"{SAVE_PATH}/distribution_of_sat_lengths.svg",
        format="svg",
        bbox_inches="tight",
        transparent=True,
    )
