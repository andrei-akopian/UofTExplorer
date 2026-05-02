"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

CORE
This Python module is the core engine that contains the course graphs.

A CourseGraphContainer contains a CourseGraphand associated programs, departments, and breadth requirements.
A CourseGraph is composed of nodes representing Courses and Requisites.
A CourseNode represents a single course.
A Requisite node represents a single layer of requirements.
A Program is a subgraph of a CourseGraph that contains the requirements for a program.

Notes:
    Requisite hashes are unique string/hash representations of Requisite nodes.
    The hash begins with the degree metric, followed by the string representation of each child, sorted alphabetically.
    A course child is represented by its unique course code.
    A Requisite child is represented by its hash, wrapped in parentheses.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import total_ordering
from typing import Any, Callable, Hashable


class CourseGraphContainer:
    """
    A data structure that contains a CourseGraph and its associated programs, departments, and breadth categories.

    Instance Attributes:
        - graph: the associated CourseGraph
        - curr_graph: a subgraph of graph that is currently being displayed and used for analysis
        - programs: mapping of program codes to Program objects
        - departments: mapping of department codes to department names
        - breadths: mapping of breadth codes to breadth category names
        - live_stats: a dictionary of live statistics about curr_graph
    """

    graph: CourseGraph
    programs: dict[str, Program]
    departments: dict[str, str]
    breadths: dict[str, str]

    def __init__(self, graph: CourseGraph, programs: dict[str, Program],
                 departments: dict[str, str], breadths: dict[str, str]) -> None:
        """
        Initialize a new CourseGraphContainer.
        """
        self.graph = graph
        self.programs = programs
        self.departments = departments
        self.breadths = breadths

    def get_filtered_programs(self, condition: Callable) -> list[Program]:
        """
        Return a list of filtered programs for this CourseGraph based on the given condition.
        """
        filtered_program_list = []

        # Iterate over all programs
        for program in self.programs:

            # Check if it satisfies the condition
            if condition(self.programs[program]):
                filtered_program_list.append(self.programs[program])

        return filtered_program_list

    def get_information(self, query: str) -> dict[str, str | list]:
        """
        Return information about a course or requisite in dictionary format, to be used for the frontend.

        Preconditions:
            - query == query.upper()
        """
        if query in self.graph.courses:
            course = self.graph.courses[query]
            return course.data.to_dict()

        elif query in self.graph.requisites:
            requisite = self.graph.requisites[query]
            return requisite.to_dict()

        else:
            return {"results": [], "error": "Invalid Course Code"}


class CourseGraph:
    """
    A graph consisting of courses and requisites.

    Courses and requisites are both types of nodes in the graph.
    Requisites can contain both courses and other requisites. Edges are represented by the courses and requisites
        referred to by each requisite.

    Instance Attributes:
        - courses: a mapping from the course code to the CourseNode in the graph
        - requisites: a mapping from the requisite hash* (see note in module docstring) to the Requisite in the graph

    Representation Invariants:
        - each mapped target CourseNode is unique
        - each mapped target Requisite is unique
    """

    courses: dict[str, CourseNode]
    requisites: dict[str, Requisite]

    def __init__(
        self,
        courses: dict[str, CourseNode] = None,
        requisites: dict[str, Requisite] = None
    ) -> None:
        """
        Initialize a new course graph.
        """
        if courses is None:
            self.courses = {}
        else:
            self.courses = courses

        if requisites is None:
            self.requisites = {}
        else:
            self.requisites = requisites

    def num_courses(self) -> int:
        """
        Return the number of courses stored in this graph.
        """
        return len(self.courses)

    def num_requisites(self) -> int:
        """
        Return the number of requisites stored in this graph.
        """
        return len(self.requisites)

    def avg_num_direct_requisites(self) -> float:
        """
        Return the average number of direct requisites stored in this graph, rounded to two decimal places.

        A direct requisite is defined as the children of a node, which can be a CourseNode or Requisite.
        """
        num_direct_reqs = []
        for course in self.courses:
            if self.courses[course].prereqs is not None:
                num_direct_reqs.append(len(self.courses[course].prereqs.reqs))
            else:
                num_direct_reqs.append(0)

        return round(sum(num_direct_reqs) / len(num_direct_reqs), 2)

    def get_filtered_courses(self, conditions: list[Callable], condition_keys: list[Hashable] = None)\
            -> list[dict[str, CourseNode]] | dict[Hashable, dict[str, CourseNode]]:
        """
        Return either a list or dictionary containing filtered courses based on the given Callable conditions.

        If condition_keys is None, return a list of dictionaries, where:
            - the returned list is the same length as conditions,
            - each element in the returned list is a dictionary mapping course codes to CourseNode objects, and
            - each course within the dictionary that is located at index i satisfies conditions[i].

            For example, graph.get_filtered_courses(
                [lambda course, b=breadth: course.is_in_breadth(b) for breadth in ['1', '2', '3', '4', '5']]
            ) returns
            [dict of courses in breadth '1', dict of courses in breadth '2', dict of courses in breadth '3',
             dict of courses in breadth '4', dict of courses in breadth '5']

        If condition_keys is not None, return a dictionary of dictionaries, where:
            - the returned outer dictionary uses condition_keys as keys, mapping them to the inner dictionaries,
            - the inner dictionaries map course codes to CourseNode objects, and
            - each course within the inner dictionary satisfies its corresponding Callable condition.

            For example, graph.get_filtered_courses(
                [lambda course, b=breadth: course.is_in_breadth(b) for breadth in ['1', '2', '3', '4', '5']],
                ['1', '2', '3', '4', '5']
            ) returns
            ['1': dict of courses in breadth '1',
             '2': dict of courses in breadth '2',
             '3': dict of courses in breadth '3',
             '4': dict of courses in breadth '4',
             '5': dict of courses in breadth '5']

        If len(conditions) == 0, then this simply returns [self.courses].

        Preconditions:
            - all Callables take in a CourseNode object as its only parameter
            - all Callables in conditions return True or False
            - condition_keys is None or len(condition_keys) == len(conditions)
        """
        # Return entire course dictionary if len(conditions) == 0
        if len(conditions) == 0:
            return [self.courses]

        # If condition_keys is not provided, return a list as specified in the docstring
        if condition_keys is None:
            filtered_course_list = [{} for _ in range(len(conditions))]

            # Traverse through the full course dictionary
            for course in self.courses:
                # Check each condition
                for i in range(len(conditions)):
                    # If condition is fulfilled, add this course to the corresponding filtered dictionary
                    if conditions[i](self.courses[course]):
                        filtered_course_list[i][course] = self.courses[course]

            return filtered_course_list

        # Otherwise, condition_keys is provided, so return a dict as specified in the docstring
        else:
            # Initialize dictionary
            filtered_course_dict = {k: {} for k in condition_keys}

            # Traverse through full course dictionary
            for course in self.courses:
                # Check each condition
                for i in range(len(conditions)):
                    # If condition is fulfilled, add this course to the corresponding filtered dictionary
                    if conditions[i](self.courses[course]):
                        filtered_course_dict[condition_keys[i]][course] = self.courses[course]

            return filtered_course_dict

    def get_satisfied_courses(self, courses: list[CourseNode]) -> dict[str, CourseNode]:
        """
        Given a list of courses taken, return a dictionary of courses that can now be taken.

        This checks if the course's prerequisites, corequisites, and exclusions are satisified given the list of
        courses taken.
        """
        courses_taken = courses.copy()
        possible_courses = {}

        # Iterate over all courses
        for course in self.courses:
            # Check that course has not been taken and that it is satisfied
            if (self.courses[course] not in courses_taken
                    and self.courses[course].is_satisfied(courses_taken, False)):

                # Add it to the list of possible courses if it is not taken
                possible_courses[course] = self.courses[course]

        return possible_courses


@total_ordering
class CourseNode:
    """
    A node representing a course.

    Instance Attributes:
        - code: the course code of this course
        - data: the non-requisite data of this course
        - prereqs: the prerequisites of this course
        - coreqs: the corequisites of this course
        - postreqs: dictionary of Requisite objects that refer to this course
        - exclusions: the exclusions of this course
        - program_backlinks: dictionary of all the programs this course belongs to

    Representation Invariants:
        - self.code != ""
    """

    code: str
    data: CourseData
    prereqs: Requisite
    coreqs: Requisite
    postreqs: dict[str, Requisite]
    exclusions: Requisite
    program_backlinks: dict[str, Program]

    def __init__(
        self,
        code: str,
        data: CourseData,
        prereqs: Requisite = None,
        coreqs: Requisite = None,
        postreqs: dict[str, Requisite] = None,
        exclusions: Requisite = None,
        program_backlinks: dict[str, Program] = None
    ) -> None:
        """
        Initialize a new course node.
        """
        self.code = code
        self.data = data
        self.prereqs = prereqs
        self.coreqs = coreqs

        if postreqs is None:
            self.postreqs = {}
        else:
            self.postreqs = postreqs

        self.exclusions = exclusions

        if program_backlinks is None:
            self.program_backlinks = {}
        else:
            self.program_backlinks = program_backlinks

    def __str__(self) -> str:
        """
        Return the string representation (hash) of this CourseNode, which is the course code.
        """
        return self.code

    def __eq__(self, other: Any) -> bool:
        """
        Return whether this CourseNode is equal to the other.

        If other is a CourseNode, return whether the course codes are equal.
        If other is a Requisite, return False.
        """
        if isinstance(other, CourseNode):
            return self.code == other.code
        elif isinstance(other, Requisite):
            return False
        else:
            return NotImplemented

    def __lt__(self, other: Any) -> bool:
        """
        Return whether this CourseNode is less than the other.

        If other is a CourseNode, return whether this course code is less than the other course code.
        If other is a Requisite, return True.
        """
        if isinstance(other, CourseNode):
            return self.code < other.code
        elif isinstance(other, Requisite):
            return True
        else:
            return NotImplemented

    def split_code(self) -> list[str]:
        """
        Splits the course_code string into a list of each component of the course code.

        The returned list contains the department code, course number, length (H or Y), and campus number.

        If the course code is nonstandard, returns an empty list.
        """
        # If the course code is nonstandard, return empty list
        if len(self.code) != 8 or not self.code.isupper():
            return []

        department_code = ""
        course_number = ""
        length = ""
        campus = ""
        i = 0

        # Department code
        while i < len(self.code) and self.code[i].isalpha():
            department_code += self.code[i]
            i += 1

        # Course number
        while i < len(self.code) and self.code[i].isdigit():
            course_number += self.code[i]
            i += 1

        # Length (year) or (half year)
        while i < len(self.code) and self.code[i].isalpha():
            length += self.code[i]
            i += 1

        # Campus number
        while i < len(self.code) and self.code[i].isdigit():
            campus += self.code[i]
            i += 1

        return [department_code, course_number, length, campus]

    def to_url(self) -> str:
        """
        Return the URL of the UofT webpage that contains the information about this course.
        """
        return f"https://artsci.calendar.utoronto.ca/course/{self.code.lower()}"

    def is_cr_ncr(self, is_cr_ncr: bool) -> bool:
        """
        Return whether this course's CR/NCR matches the given is_cr_ncr boolean.
        """
        return self.data.cr_ncr == is_cr_ncr

    def matches_cr_ncr(self, eligible_cr_ncr: str) -> bool:
        """
        Return whether this course's CR/NCR eligibility matches the given eligibility.

        Preconditions:
            - eligible_cr_ncr in {'eligible', 'ineligible'}
        """
        if eligible_cr_ncr == 'eligible':
            return self.data.cr_ncr is True
        else:
            return self.data.cr_ncr is False

    def is_in_breadth(self, breadth: str) -> bool:
        """
        Return whether this course is in the given breadth category.

        Preconditions:
            - breadth in {'1', '2', '3', '4', '5'}
        """
        if breadth in self.data.breadth or int(breadth) in self.data.breadth:
            return True
        return False

    def is_in_department(self, dept_code: str) -> bool:
        """
        Return whether this course is in the given department, i.e. whether the first three characters in the course
        code match dept_code.
        """
        if self.data.code_split[0] == dept_code:
            return True
        return False

    def code_contains(self, string: str) -> bool:
        """
        Return whether this course code contains string, case-insensitive.
        """
        if string.lower() in self.code.lower():
            return True
        return False

    def title_contains(self, string: str) -> bool:
        """
        Return whether this course title contains string, case-insensitive.
        """
        if string.lower() in self.data.title.lower():
            return True
        return False

    def is_satisfied(self, courses: list[CourseNode], satisfied_if_no_prereqs: bool = True) -> bool:
        """
        Return whether the conditions of this course's prerequisites, corequisites, and exclusions are satisfied,
        given a list of courses.

        If self is in courses, return True.

        If satisfied_if_no_prereqs is True, if this course has no prerequisites, return True (as long as this course's
            corequisites and exclusions are also satisfied).
        If satisifed_if_no_prereqs is False, if this course has no prerequisites, return False, without checking whether
            this course's corequisitse and exclusions are satisfied.

        Note: exclusions are considered to be 'satisfied' when self.exclusions.is_satsified(courses) returns False,
            since exclusions contain the courses that must not be taken.
        """
        # If self is in courses, return True
        if self in courses:
            return True

        # If self has no prerequisites
        if self.prereqs is None:

            # Check whether this course's corequisites and exclusions are satisfied
            if satisfied_if_no_prereqs:
                return (self.coreqs is None or self.coreqs.is_satisfied(courses)
                        and (self.exclusions is None or not self.exclusions.is_satisfied(courses)))

            # Otherwise, return False without checking whether this course's corequisites and exclusions are satisfied
            else:
                return False

        # Otherwise, self has prerequisites
        # Return whether corequisites and exclusions are satisfied
        else:
            return (self.prereqs.is_satisfied(courses)
                    and (self.coreqs is None or self.coreqs.is_satisfied(courses))
                    and (self.exclusions is None or not self.exclusions.is_satisfied(courses)))


@dataclass
class CourseData:
    """
    The non-requisite data of a course.

    Instance Attributes:
        - code_split: the split course code of this course
        - title: the title of this course
        - description: long description of this course
        - cr_ncr: eligibility to be CR/NCR
        - hours: the content hours, mapping the string type of hour to its total duration
        - breadth: breadth credit of this course, mapping the breadth number to its credit value *doubled*
        - original_requisite_strings: the original requisite strings shown on the Academic Calendar webpages

    Representation Invariants:
        - self.title != ""
        - all(key in {1, 2, 3, 4, 5} for key in self.breadth)
        - all(key in {"prerequisites", "corequisites", "exclusions"} for key in self.original_requisite_strings)
    """

    code_split: list[str | int]
    title: str
    description: str
    cr_ncr: bool
    hours: dict[str, int]
    breadth: dict[int, int]
    original_requisite_strings: dict[str, str]

    def __init__(
        self, code_split: list[str], title: str, description: str, cr_ncr: bool, hours: dict, breadth: dict,
        original_requisite_strings: dict[str, str]
    ) -> None:
        """
        Initialize a new CourseData object.
        """
        self.code_split = code_split
        self.title = title
        self.description = description
        self.cr_ncr = cr_ncr
        self.hours = hours
        self.breadth = breadth
        self.original_requisite_strings = original_requisite_strings

    def to_dict(self) -> dict[str, str]:
        """
        Return information about a course in dictionary format, to be used for the frontend.
        """
        # Add basic information
        information = {
            "title": self.title,
            "description": self.description,
        }

        # Add information about hours
        hours_str = " | ".join(f"{hour_type.capitalize()}: {self.hours[hour_type]}"
                               for hour_type in self.hours if self.hours[hour_type] != 0)
        information["Hours"] = hours_str

        # Add information about breadths
        breadth_str = ", ".join(str(br_type) for br_type in self.breadth if self.breadth[br_type] != 0)
        information["Breadth Categories"] = breadth_str

        # Add information about requisites
        for field in self.original_requisite_strings:
            if len(self.original_requisite_strings[field]) > 0:
                information[field.capitalize()] = self.original_requisite_strings[field]

        return information


@total_ordering
class Requisite:
    """
    A node in a requisite structure that contains a list of other courses and/or other requisites.
    The degree represents how many of the inner courses/requisites need to be satisfied in order for this Requisite
        to be considered satisfied.

    Requisite hashes are unique string/hash representations of Requisite nodes.
    The hash begins with the degree metric, followed by the string representation of each inner course/requisite.

    The list is always sorted, using the following rules:
        - all CourseNode objects appear at the beginning of the list, and are sorted based on their hash (course code)
        - all Requisite objects appear afterward, and are sorted based on their hash

    Instance Attributes:
        - reqs: list of courses or requisites contained within this Requisite
        - degree: the number of courses in reqs that must be satisfied in order for this Requisite to be considered
            satisfied
        - num_backlinks: the number of other CourseNode and Requisite objects that refer to this Requisite
        - postreqs: dictionary of all the CourseNodes and Requisites that refers to this as a dependency
        - simple_hash: simple string representation of this Requisite, following the format shown in the Academic
            Calendar; note that the format is slightly different from the normal hash of Requisite objects

    Representation Invariants:
        - len(self.reqs) > 0
        - 0 < self.degree <= len(self.reqs)
        - reqs == sorted(reqs)
    """

    reqs: list[CourseNode | Requisite]
    degree: int
    num_backlinks: int
    postreqs: dict[str, CourseNode | Requisite]
    simple_hash: str

    # Private Instance Attributes:
    #  - _string: unique string/hash representation of this requisite.
    #             Requisite hashes are unique string/hash representations of Requisite nodes.
    #             The hash begins with its degree, followed by the hash of each child, sorted alphabetally.
    #             A course child is represented by its unique course code.
    #             A Requisite child is represented by its hash, wrapped in parentheses.
    #             Example: "5,(2,APM102,CAT999),(1,CSC110,CSC111),APM101,MAT137,ZZZ135"
    _string: str

    def __init__(self, reqs: list[CourseNode | Requisite] = None, degree: int = 0, num_backlinks: int = 0,
                 postreqs: dict[str, CourseNode | Requisite] = None) -> None:
        """
        Initialize a new Requisite object.
        """
        if reqs is None:
            self.reqs = []
        else:
            self.reqs = sorted(reqs)  # Ensure self.reqs is sorted to maintain representation invariant
        self.degree = degree

        self.num_backlinks = num_backlinks

        if postreqs is None:
            self.postreqs = {}
        else:
            self.postreqs = postreqs

        # Compute the string representation and simple hash for this Requisite
        self._update_string()
        self._update_simple_hash()

    def __str__(self) -> str:
        """
        Return the string representation for this Requisite using the format described in the class header.
        """
        return self._string

    def __len__(self) -> int:
        """
        Return the length of this Requisite, defined to be the length of self.reqs.
        """
        return len(self.reqs)

    def __eq__(self, other: Any) -> bool:
        """
        Return whether this Requisite is equal to the other.

        If other is a Requisite, compare their hashes.
        """
        if isinstance(other, Requisite):
            return str(self) == str(other)
        else:
            return NotImplemented

    def __lt__(self, other: Any) -> bool:
        """
        Return whether this Requisite is less than the other.

        If other is a Requisite, compare their hashes.
        """
        if isinstance(other, Requisite):
            return str(self) < str(other)
        elif isinstance(other, CourseNode):
            return False
        else:
            return NotImplemented

    def _update_string(self) -> None:
        """
        Update the string representation for this Requisite using the format described in the class header.
        """
        string_so_far = f"{self.degree},"

        # Iterate over requirements, which are assumed to be sorted
        for req in self.reqs:
            # If req is a course, add course code to the string
            if isinstance(req, CourseNode):
                string_so_far += f"{req.code},"

            # Otherwise, req is a requisite
            # Recursively get the string representation for req
            else:
                string_so_far += f"({str(req)}),"

        # Update instance attribute, removing the last comma
        self._string = string_so_far[:-1]

    def _update_simple_hash(self) -> None:
        """
        Update the simple readable string representation of this Requisite, following the format used by the
        Academic Calendar.
        """
        string_so_far = ""

        if self.degree == 1:  # OR gate
            logic_separator = "/"
        else:  # AND gate
            logic_separator = ","

        # Iterate over requirements, which are assumed to be sorted
        for req in self.reqs:
            # If req is a course, add course code to the string
            if isinstance(req, CourseNode):
                string_so_far += f"{req.code}{logic_separator}"

            # Otherwise, req is a requisite
            # Recursively get the string representation for req
            else:
                string_so_far += f"({req.simple_hash}){logic_separator}"

        # Update instance attribute, removing the last logic separator
        self.simple_hash = string_so_far[:-1]

    def to_dict(self) -> dict:
        """
        Return information about this Requisite in dictionary format, to be used for the frontend.
        """
        title = "OR"

        if self.degree == 1:
            title = "OR"
        elif self.degree > 1:
            title = "AND"

        return {
            "title": title,
            "description": self.simple_hash,
            "backlinks": self.num_backlinks
        }

    def increment_num_backlinks(self) -> None:
        """
        Increment the number of backlinks for this Requisite by 1.
        """
        self.num_backlinks += 1

    def add_requisite(self, requisite: CourseNode | Requisite) -> None:
        """
        Add the given requisite, either a single course or a Requisite, to this Requisite object.
        """
        self.reqs.append(requisite)
        self.reqs.sort()  # Sort the list to maintain the representation invariant

        # Update the hash for this Requisite
        self._update_string()
        self._update_simple_hash()

    def is_satisfied(self, courses: list[CourseNode]) -> bool:
        """
        Return whether the conditions of this Requisite are satisfied, given a list of courses taken.
        """
        # Maximum number of requirements in this Requisite that can be not satisfied
        max_non_satisfied = len(self.reqs) - self.degree

        # Counter for number of requirements satisfied and not satisfied
        num_satisfied_so_far = 0
        num_not_satisfied_so_far = 0

        # Iterate through this Requisite's requirements
        for req in self.reqs:
            # Check if this requirement is a single course
            if isinstance(req, CourseNode):
                # Base case: check if this required course is listed
                if req in courses:
                    num_satisfied_so_far += 1
                else:
                    num_not_satisfied_so_far += 1

            # Otherwise, this requirement is a Requisite
            else:
                # Perform recursive call to check whether it is satisfied
                if req.is_satisfied(courses):
                    num_satisfied_so_far += 1
                else:
                    num_not_satisfied_so_far += 1

            # Check whether overall conditions are satisfied
            if num_satisfied_so_far >= self.degree:
                return True

            # Check whether there have been too many non-satisfied conditions
            elif num_not_satisfied_so_far > max_non_satisfied:
                return False

        return False


class Program:
    """
    A subgraph of the complete CourseGraph, containing only the required courses for a given program.

    Instance Attributes:
        - code: the program code
        - title: the program name
        - graph: the program's subgraph of the complete CourseGraph

    Representation Invariants:
        - self.code != ""
        - self.title != ""
    """

    code: str
    title: str
    graph: CourseGraph

    def __init__(self, code: str, title: str, graph: CourseGraph) -> None:
        """
        Initialize a new Program.
        """
        self.code = code
        self.title = title
        self.graph = graph

    def code_contains(self, string: str) -> bool:
        """
        Return whether this program code contains string, case-insensitive.
        """
        if string.lower() in self.code.lower():
            return True
        return False

    def title_contains(self, string: str) -> bool:
        """
        Return whether this program title contains string, case-insensitive.
        """
        if string.lower() in self.title.lower():
            return True
        return False


if __name__ == '__main__':
    # pass
    import doctest
    doctest.testmod(verbose=True)

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': ['annotations', 'dataclass', 'functools', 'typing'],
        'allowed-io': [],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 20,
        'max-branches': 15,
        'max-args': 8
    })
