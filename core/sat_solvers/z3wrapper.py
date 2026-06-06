"""
UofTExplorer

Z3 WRAPPER
SAT solver for course pre-requisites using the Z3 python package.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

from z3 import *
from core import algorithms
from core.core import CourseGraph, CourseNode, Requisite


def solve_sat(
    graph: CourseGraph,
    targets: list[str | CourseNode | Requisite],
    taken: list[str | CourseNode | Requisite] = [],
    avoids: list[str | CourseNode | Requisite] = [],
) -> tuple[bool, dict[str, bool], list[str]]:
    """
    Satisfy the target courses using the z3 sat solving package.
    Return:
    - whether there is a solution: bool
    - dictionary of all involved courses and requisites
         and their truth values in the solution: dict[str, bool]
    - list of true courses (derived from the above dict)
    """
    requisites = dict()
    courses = dict()
    processed: set[str] = set()
    formula = Optimize()
    for t in avoids:
        t = _get_item_object(graph, t)
        b = None
        if isinstance(t, CourseNode):
            b = Bool(
                t.code
            )  # TODO facter out this structure into a separate mutating function
            courses[t.code] = b
        elif isinstance(t, Requisite):
            b = Bool(str(t))
            requisites[str(t)] = b
        else:
            raise Exception("unexpected data type.")
        formula.add(Not(b))
    for t in taken:
        t = _get_item_object(graph, t)
        b = None
        if isinstance(t, CourseNode):
            b = Bool(t.code)
            courses[t.code] = b
            processed.add(t.code)
        elif isinstance(t, Requisite):
            b = Bool(str(t))
            requisites[str(t)] = b
            processed.add(str(t))
        else:
            raise Exception("unexpected data type.")
        formula.add(b)
        formula.set_initial_value(b, True)
    stack: list[CourseNode | Requisite] = []
    for t in targets:
        t = _get_item_object(graph, t)
        b = None
        if isinstance(t, CourseNode):
            b = Bool(t.code)
            courses[t.code] = b
        elif isinstance(t, Requisite):
            b = Bool(str(t))
            requisites[str(t)] = b
        else:
            raise Exception("unexpected data type.")
        formula.add(b)
        stack.append(t)
    # build up the full tree of implications
    while len(stack) > 0:
        t = stack.pop()
        assert isinstance(t, CourseNode) or isinstance(t, Requisite)
        if isinstance(t, CourseNode):
            if t.code in processed:
                continue
            if t.code not in courses:
                courses[t.code] = Bool(t.code)
            if t.prereqs is not None:
                p = t.prereqs
                b = None
                if str(p) not in requisites:
                    b = Bool(str(p))
                    requisites[str(p)] = b
                else:
                    b = requisites[str(p)]
                formula.add(Implies(courses[t.code], requisites[str(p)]))
                stack.append(p)
            if t.coreqs is not None:
                p = t.coreqs
                b = None
                if str(p) not in requisites:
                    b = Bool(str(p))
                    requisites[str(p)] = b
                else:
                    b = requisites[str(p)]
                formula.add(Implies(courses[t.code], requisites[str(p)]))
                stack.append(p)
            processed.add(t.code)
        elif isinstance(t, Requisite):
            if str(t) in processed:
                continue
            if str(t) not in requisites:
                requisites[str(t)] = Bool(str(t))
            l = []
            for r in t.reqs:
                if isinstance(r, CourseNode):
                    b = None
                    if r.code not in courses:
                        b = Bool(r.code)
                        courses[r.code] = b
                    else:
                        b = courses[r.code]
                    l.append(b)
                    stack.append(r)
                elif isinstance(r, Requisite):
                    b = None
                    if str(r) not in requisites:
                        b = Bool(str(r))
                        requisites[str(r)] = b
                    else:
                        b = requisites[str(r)]
                    l.append(b)
                    stack.append(r)
                else:
                    raise Exception("unexpected data type.")
            if len(l) == 0:
                raise Exception("Emtpy Requisite")
            elif len(l) == 1:
                formula.add(Implies(requisites[str(t)], l[0]))
            else:
                if t.degree == 1:
                    formula.add(Implies(requisites[str(t)], Or(*l)))
                elif t.degree == len(l):
                    formula.add(Implies(requisites[str(t)], And(*l)))
                else:
                    raise Exception(
                        "degree != number of requisites. Conditionals other than AND and OR are not impelmented."
                    )
            processed.add(str(t))
        else:
            raise Exception("unexpected data type.")
    cost_l = []
    for course in courses.values():
        cost_l.append(If(course, 1, 0))
    cost = Sum(cost_l)

    formula.minimize(cost)

    satisfiable = bool(formula.check().r)
    if satisfiable:
        model = formula.model()
        true_courses = []
        full_dict = dict()
        for d in model.decls():
            string_repr = d.name()  # course code or requisite hash
            r = model[d]
            full_dict[string_repr] = r
            if r and string_repr in courses:
                true_courses.append(string_repr)
        return True, full_dict, true_courses
    else:
        return False, dict(), []


def _get_item_object(graph, item: str | CourseNode | Requisite):
    if isinstance(item, str):
        if item in graph.courses:
            return graph.courses[item]
        elif item in graph.requisites:
            return graph.requisites[item]
    # sanity checks
    elif isinstance(item, CourseNode):
        assert CourseNode.code in graph.courses
    elif isinstance(item, Requisite):
        assert str(Requisite) in graph.requisites
    return item
