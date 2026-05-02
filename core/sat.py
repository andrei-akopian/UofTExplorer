"""
CSC111 Winter 2026 Project 2

SAT
This Python module provides the solver for the Path Explorer.
Solves for the shortest list of courses one must take in order to take some target courses.
Shorten this task as the "SAT" problem, essentially a variant of the Satisfiability Problem in computing.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

from __future__ import annotations
from typing import Generator

import core.algorithms as algorithms
from core.core import CourseGraph, CourseNode, Requisite


def solve_sat(graph: CourseGraph, targets: list[str], taken: list[str], avoids: list[str],
              progress_callback=None) -> Generator[int | list[CourseNode]]:
    """
    The primary public interface for solving the SAT via brute-forcing.
    Takes in the complete Course Graph, the target courses to take, courses taken, and courses to avoid taking.
    First yields the number of fundamentals to brute force.
    Then yields the solution (shortest list of courses).
    Optional progress_callback is called with (case_bits, dimension) during the brute-force.
    case_bits is a list of 0s and 1s representing the current case being evaluated.
    """
    # the helper function that gives the satisfying results
    solver = _solve_sat(graph, targets, set(taken), avoids, progress_callback)
    dim = next(solver)  # the first yield from solver; the number of fundamentals
    yield dim

    # tracking variables for the shortest satisfying list of courses
    solution: list[CourseNode] = []
    shortest_so_far: int = -1

    curr = next(solver)  # a satisfying list of courses
    while curr:
        if shortest_so_far == -1:  # first solution, always accept to replace default null solution
            solution = curr
            shortest_so_far = len(curr)
            curr = next(solver)
            continue

        # checks whether the current satisfying list is shorter
        if len(curr) < shortest_so_far:
            solution = curr
            shortest_so_far = len(curr)

        curr = next(solver)

    yield solution  # yields the shortest satisfying list of courses
    return


def _solve_sat(graph: CourseGraph, targets: list[str], taken: set[str], avoids: list[str],
               progress_callback=None) -> Generator[int | list[CourseNode]]:
    """
    Private helper function to solving the SAT.
    Yields the number of fundamentals first.
    Then yields all satisfying course lists one at a time.
    Optional progress_callback is called with (case_bits, dimension) during brute-force.
    case_bits is a list of 0s and 1s representing the current case.
    """
    # initialize the fundamentals
    fundamentals = get_fundamentals(graph, targets, list(taken), avoids)
    dimension = len(fundamentals)
    yield dimension

    # initialize the brute forcing test case generator
    case_generator = _sat_case_generator([1] * dimension, 0)
    curr = next(case_generator)

    # START OF CODE WRITTEN BY Claude Haiku 4.5
    cases_evaluated = 0
    last_callback_case = cases_evaluated
    callback_debounce = 100  # fire callback every 100 cases to avoid performance impact
    # END OF CODE WRITTEN BY Claude Haiku 4.5

    while curr:
        case = set()  # the set of courses planned to take
        cases_evaluated += 1

        # START OF CODE WRITTEN BY Claude Haiku 4.5
        # call progress callback if provided (debounced)
        if progress_callback and (cases_evaluated - last_callback_case) >= callback_debounce:
            progress_callback(curr.copy(), dimension)
            last_callback_case = cases_evaluated
        # END OF CODE WRITTEN BY Claude Haiku 4.5

        # adds the current brute force case of courses and the target courses
        for i in range(0, dimension):
            if curr[i] == 1:
                case.add(fundamentals[i])
        for t in targets:
            case.add(t)

        is_sat = True
        memo = {}  # the memoization dictionary for verification
        for t in targets:
            # verifies whether target course can be taken
            if not _verify(graph.courses[t], taken, case, set(), memo):
                is_sat = False
                break

        if is_sat:  # satisfying case
            yield [graph.courses[fundamentals[i]] for i in range(dimension) if curr[i] == 1]

        try:
            curr = case_generator.send(is_sat)
        except StopIteration:
            break

    yield []  # yields if no satisfying solution is found or
    return


def _sat_case_generator(case: list[int], pivot: int) -> Generator[list[int], bool]:
    """
    Recursive generator function that
    (1) yields the current input case
    (2) if the caller return is True, recursively yield from all subcases.
    """
    # yields current input case
    success = yield case
    if not success:
        return

    # recursively call subcases
    for i in range(pivot, len(case)):
        case_copy = case.copy()
        case_copy[i] = 0
        yield from _sat_case_generator(case_copy, i + 1)

    return


def get_fundamentals(graph: CourseGraph, targets: list[str], taken: list[str], avoids: list[str]) -> list[str]:
    """
    Returns a list of all prereq/coreq courses of targets, removing courses taken and courses to avoid.
    Does not contain the target courses.
    """
    fundamental_set: set[str] = algorithms.get_precoreq_course_set(graph, targets)
    for x in targets:
        fundamental_set.remove(x)
    for x in taken:
        if x in fundamental_set:
            fundamental_set.remove(x)
    for x in avoids:
        if x in fundamental_set:
            fundamental_set.remove(x)
    return list(fundamental_set)


def _verify(curr: CourseNode | Requisite, taken: set[str], planned: set[str], visited: set[str],
            memo: dict[str, bool]) -> bool:
    """
    Return whether curr is satisfied: taken, or planned & ready to take.
    Memo is a memoization dictionary that tracks the satisfiability already calculated.
    """
    # checks for memoization entry
    if str(curr) in memo:
        return memo[str(curr)]

    # satisfiability check for CourseNode
    if isinstance(curr, CourseNode):
        # base checks
        if str(curr) in taken:
            memo[str(curr)] = True
            return True
        if str(curr) not in planned:  # if this course is not taken and not planned, then it is unsatisfied regardless
            memo[str(curr)] = False
            return False
        if str(curr) in visited:  # this course is a circular coreq, which should be set to satisfied
            memo[str(curr)] = True
            return True

        # unvisited course, need to be calculated/checked
        visited.add(str(curr))

        if curr.prereqs and not _verify(curr.prereqs, taken, planned, visited, memo):
            memo[str(curr)] = False
            return False
        if curr.coreqs and not _verify(curr.coreqs, taken, planned, visited, memo):
            memo[str(curr)] = False
            return False
        if curr.exclusions and _verify(curr.exclusions, taken, planned, visited, memo):
            memo[str(curr)] = False
            return False

        memo[str(curr)] = True  # update memoization dictionary
        return True

    # satisfiability for Requisite node; satisfied if its number of satisified reqs >= its degree
    if isinstance(curr, Requisite):
        num_sat = 0  # accumulation variable for the number of satisfied reqs
        for req in curr.reqs:
            if _verify(req, taken, planned, visited, memo):
                num_sat += 1
                if num_sat >= curr.degree:
                    memo[str(curr)] = True
                    return True

        memo[str(curr)] = False
        return False

    print("UNKNOWN curr TYPE in sat._brute_helper")
    return False


if __name__ == '__main__':
    import doctest
    doctest.testmod(verbose=True)

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': ['annotations', 'dataclass', 'functools', 'typing'],
        'allowed-io': ['_verify'],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 20,
        'max-branches': 15,
        'max-args': 7
    })
