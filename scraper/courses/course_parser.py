"""
CSC111 Winter 2026 Project 2

ACADEMIC CALENDAR PARSER
This Python module provides functions to parse University of Toronto Academic Calendar pages.
It takes html files from ../scraper/raw_output and converts them into courses.json stored to ../data/courses.json

The HTMLs might not have a standarized format, and might contain incorrectly structured data.
- in fact, a few courses have non-matching parenthesies

The philosophy of the parsers is thus:
- parsers must be complicated by necessity, do not seek to simplify or clean them up like normal modules.
- write many assert statements, so if unexpected cases are reported immediately.
    make use of global variables, to make asserts and debugging most powerful.
- due to changing requirements from downstream functions,
    parsers are to always maintain flexibility and strong debugging infrastructure.
- code partaining to edge cases no longer needed, is to be left commented out rather than removed.
    Need for documentation and edgecase detection might arise at any moment.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

from __future__ import annotations
import json
import os
import re
import time
from typing import Optional
import logging
import bs4


SCRAPE_FOLDER = "../scraper/raw_output/"
PARSING_TARGETS: dict[str, dict] = {
    "UTM": {
        "filepattern": "page_PAGENUMBER_utm.html",
        "page_range": range(0, 81 + 1)
    },
    "UTSG": {
        "filepattern": "page_PAGENUMBER_utsg.html",
        "page_range": range(0, 178 + 1)
    },
    "UTSC": {
        "filepattern": "page_PAGENUMBER_utsc.html",
        "page_range": range(0, 72 + 1)
    },
}
SAVE_FOLDER: str = "../data/"
SAVE_FILENAME: str = "courses.json"
SAVE_PATH = SAVE_FOLDER + SAVE_FILENAME
PARSER_LOGS = "./parser_logs"
GLOSSARY: None | dict[str, str] = None  # list of all known department codes
BREADTH_STRINGS = [
    "Creative and Cultural Representations (1)",
    "Thought, Belief and Behaviour (2)",
    "Society and its Institutions (3)",
    "Living Things and Their Environment (4)",
    "The Physical and Mathematical Universes (5)",
]
LENGTHS = {"H": "half-year", "Y": "full-year"}  # course lengths
CAMPUSES = {
    "0": "Instructor Supervised Off-Campus Group Project",
    "1": "UTSG",
    "3": "UTSC",  # https://utsc.calendar.utoronto.ca/search-courses
    "5": "UTM",  # https://utm.calendar.utoronto.ca/course-search
}
ORS = ["/", "OR"]
ANDS = [",", ";"]
OP_PARENTH = ["(", "["]
CL_PARENTH = [")", "]"]
PARENTHS = OP_PARENTH + CL_PARENTH
SPECIAL_CHARS = ORS + ANDS + PARENTHS
WHITESPACE = [" ", "\u200b", "\xa0", "\n"]
SEPARATORS = ["•", "-", " ", "\u200b", "\xa0", "\n"]  # used by course_name_parser to split the name into code and title

# regex pattern for detecting notes about CR/NCR eligibility
CR_NCR_REGEX_PATTERN = re.compile(r"Not (el(e|i)gible|available) for( the)? CR/NCR( option)?\.", re.IGNORECASE)


class ContextFilter(logging.Filter):
    """Context filter for the logger. Makes current course available to the logger."""
    parent: CourseParser

    def __init__(self, parent: CourseParser) -> None:
        self.parent = parent
        super().__init__()

    def filter(self, record: logging.LogRecord) -> bool:
        """Custom filter for the logger. Adds the current program to the logging."""
        record.current_course = self.parent.current_course
        return True


# ==== End Logging Configuration ===

# List of fields a course DOM element might have (and examples of their occurences)
# used for verification that nothing was missed
UNEXPECTED_FIELDS_CATCHER = {  # Everything in UTSG ArtSci calendar, is accounted for.
    'js-views-accordion-group-header': 'WRR414H1',  # unimportant
    'views-row': 'WRR414H1',  # wrapper
    'views-field': 'WRR414H1',   # description
    'views-field-field-hours': 'WRR414H1',  # accounted for
    'views-label': 'WRR414H1',  # wrapper
    'views-label-field-hours': 'WRR414H1',  # accounted for
    'field-content': 'WRR414H1',  # wrapper
    'views-field-body': 'WRR414H1',  # description, accounted for
    'views-field-field-breadth-requirements': 'WRR414H1',  # accounted for
    'views-label-field-breadth-requirements': 'WRR414H1',  # accounted for
    'views-field-field-previous-course-number': 'WRR414H1',  # accounted for
    'views-label-field-previous-course-number': 'WRR414H1',  # accounted for
    'views-field-field-exclusion': 'WRR407H1',  # accounted for
    'views-label-field-exclusion': 'WRR407H1',  # accounted for
    'views-field-field-prerequisite': 'WRR414H1',  # accounted for
    'views-label-field-prerequisite': 'WRR414H1',  # accounted for
    'views-field-field-recommended': 'WRR317H1',  # full title: recommended preparation, accounted for
    'views-label-field-recommended': 'WRR317H1',  # accounted for
    'views-field-field-course-experience': 'VIC396H0',  # accounted for
    'views-label-field-course-experience': 'VIC396H0',  # accounted for
    'views-field-field-corequisite': 'VIC493H1',  # accounted for
    'views-label-field-corequisite': 'VIC493H1'  # accounted for
}


class CourseParser:
    """
    Object that contains everything necessary to parse the course HTMLs.
    """
    general_logger: logging.Logger  # logs general messages and events
    modifications_logger: logging.Logger   # logs modifications made to the data.
    courses: list[dict]
    counters: dict[str, int] = {
        "courses_parsed": 0,
        "courses_accepted": 0,
        "requisite_parsings": 0
    }
    current_course: str  # the program the program parser is currentluy parsing, used by the logger.
    bs4_prefered_parser: str

    def __init__(self, log_to_file: bool = False) -> None:
        self.current_course = ""
        self.counters = {
            "courses_parsed": 0,
            "courses_accepted": 0,
            "requisite_parsings": 0
        }
        self.courses = []

        # general logger setup
        if not os.path.isdir(PARSER_LOGS):
            # create directory for parsing logs, if it doesn't exist already.
            os.mkdir(PARSER_LOGS)
        self.general_logger = logging.getLogger("general_logger")
        self.general_logger.addFilter(ContextFilter(self))
        if log_to_file:
            handler: logging.Handler = logging.FileHandler(f"{PARSER_LOGS}/course_parser.log", mode="w")
        else:
            handler: logging.Handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(levelname)s %(current_course)s | %(message)s"))
        self.general_logger.addHandler(handler)
        self.general_logger.setLevel(logging.INFO)

        self.modifications_logger = logging.getLogger("modifications")
        handler = logging.FileHandler(f"{PARSER_LOGS}/modifications.log", mode="w")
        handler.setFormatter(logging.Formatter("MODIFICATION: %(current_course)s | %(message)s"))
        self.modifications_logger.addHandler(handler)
        self.modifications_logger.addFilter(ContextFilter(self))
        self.modifications_logger.propagate = False
        try:
            bs4.BeautifulSoup("<div>Test</div>", features="lxml")
            self.bs4_prefered_parser = "lxml"
        except bs4.FeatureNotFound:
            self.bs4_prefered_parser = "html.parser"

    def course_code_parser(self, course_code: str) -> Optional[list[str | int]]:
        """
        Dilutes the course code into its prime components.
        verify flag converts this into a checker.

        Returns either parsed string, or a boolean regarding whether the parse was
        successful or not.
        """
        if len(course_code) != 8 or not course_code.isupper():
            return None

        department_code = ""
        course_number = ""
        length = ""
        campus = ""
        i = 0
        # Department code
        while i < len(course_code) and course_code[i].isalpha():
            department_code += course_code[i]
            i += 1
        if len(department_code) not in [3, 4]:
            return None
        # Course number with  department
        while i < len(course_code) and course_code[i].isdigit():
            course_number += course_code[i]
            i += 1
        if (len(course_number) == 2 and len(department_code) != 4) or (
            len(course_number) > 4
        ):
            return None
        # Length (year) or (halfyear)
        while i < len(course_code) and course_code[i].isalpha():
            length += course_code[i]
            i += 1
        if len(length) != 1:
            return None
        # Compus code, see CAMPUSES constant
        while i < len(course_code) and course_code[i].isdigit():
            campus += course_code[i]
            i += 1
        if len(campus) != 1:
            return None
        assert campus in CAMPUSES
        return [department_code, int(course_number), length, int(campus)]

    def course_hours_extract_int(self, hour_entry: str) -> int:
        """
        From a course hour number format, extract integer hour number.
        Some courses like MSE498Y1, have a float number of hours. Those are rounded.

        Preconditions:
        - string s is non-emtpy has exactly one run of digits
        - the "currect" number of hours is an integer in rougly [1, 100]

        >>> cp = CourseParser()
        >>> cp.course_hours_extract_int("72L")
        72
        >>> cp.course_hours_extract_int("10T")
        10
        >>> cp.course_hours_extract_int("10.5T")
        11
        >>> cp.course_hours_extract_int("17.8T")
        18
        >>> cp.course_hours_extract_int("8.2S")
        8
        """
        clean_string = "".join(char for char in hour_entry if char.isdigit() or char == ".")
        if len(clean_string) == 0:  # we should never get an empty string
            self.general_logger.critical("encountered empty part of hour entry", hour_entry)
            return 0
        else:
            output_raw = float(clean_string)
            output_int = round(output_raw)
            if not 1 <= output_int <= 240:  # sanitfy check
                # Example: a course with 2P is ANA420H1, or 1T like ESS245H1 (might be typos)
                # Example: a course with 240P is JPM400Y1 (project courses)
                self.general_logger.info("course has very few or a lot of hours")
            return output_int

    def hours_parser(self, hours_string: str) -> dict[str, int]:
        """
        Interpret the Hours String.
        Precondition: the input is a non-empty string consisting of
        a positive decimal number and ending with a single letter from T, L, P, or S and separated by slashes.

        >>> cp = CourseParser()
        >>> cp.hours_parser("72L/10T") == {'lecture': 72, 'tutorial': 10, 'practical': 0, 'seminar': 0}
        True
        >>> cp.hours_parser("72L/10T/20S") == {'lecture': 72, 'tutorial': 10, 'practical': 0, 'seminar': 20}
        True
        >>> cp.hours_parser("10.4L/10T/16.8P")  == {'lecture': 10, 'tutorial': 10, 'practical': 17, 'seminar': 0}
        True
        """
        template = {"lecture": 0, "tutorial": 0, "practical": 0, "seminar": 0}
        if len(hours_string) == 0:
            self.general_logger.warning("empty hours field")
            return template

        split_temp = hours_string.split("/")
        for part in split_temp:
            if len(part) < 2:
                self.general_logger.critical("issue splitting hour string \"%s\"",
                                             self.current_course, hours_string
                                             )
            if "T" == part[-1]:
                template["tutorial"] = self.course_hours_extract_int(part)
            elif "L" == part[-1]:
                template["lecture"] = self.course_hours_extract_int(part)
            elif "P" == part[-1]:
                template["practical"] = self.course_hours_extract_int(part)
            elif "S" == part[-1]:
                template["seminar"] = self.course_hours_extract_int(part)
            else:
                self.general_logger.critical(
                    "%s unaccounted for hour type in \"%s\"",
                    self.current_course,
                    hours_string
                )

        return template

    def requisites_parser(self, reqisites_raw_list: list[str] | str) -> list:
        """
        The input rawlist is a list because it is BeautifulSoup's default output.

        >>> cp = CourseParser()
        >>> cp.requisites_parser("Prerequisite: MAT240H1/ MAT240H5") == ["OR", "MAT240H1", "MAT240H5"]
        True
        >>> cp.requisites_parser("Corequisite: any introductory CS course, like CSC148H1") == ["AND", "CSC148H1"]
        True
        >>> cp.requisites_parser("Corequisite: any introductory CS course, like CSC148H1") == ["AND", "CSC148H1"]
        True
        """
        if isinstance(reqisites_raw_list, str):
            assert len(reqisites_raw_list) != 0
            assert any(header in reqisites_raw_list for header in ["Prerequisite:", "Exclusion:", "Corequisite:"])
            req_string = reqisites_raw_list[reqisites_raw_list.find(":") + 1:]
        elif isinstance(reqisites_raw_list, list):
            assert len(reqisites_raw_list) != 0
            assert reqisites_raw_list[0].strip() in ["Prerequisite:", "Exclusion:", "Corequisite:"]
            req_string = "".join(reqisites_raw_list[1:])  # drop "Requisites:" prefix
        else:
            raise TypeError("Requisites parser encountered wrong argument format.")

        ops_list = self.req_string_to_opslist(req_string)
        rpn = self.requisites_to_polish_notation(ops_list)
        nested_lists_format = self.requisites_pn_to_nested_lists(rpn)
        return self.nested_lists_flattener(nested_lists_format)

    def req_string_to_opslist(self, req_string: str) -> list[str]:
        """
        Convert string of requisites into operations list.
        Remove anything that isn't a course code or operation.
        """
        token_list = []
        collector = ""
        # split the string into tokens
        for c in req_string:
            if c in SPECIAL_CHARS:
                if len(collector) > 0:
                    token_list.append(collector)
                    collector = ""
                token_list.append(c)
            elif c in WHITESPACE:
                if len(collector) > 0:
                    token_list.append(collector)
                    collector = ""
            else:
                collector += c
        if len(collector) > 0:
            token_list.append(collector)
            collector = ""
        # filter out unwanted materials
        open_parenthesies_counter = 0
        parenthesies_contents_stack = [0]
        ops_list = []
        for token in token_list:
            if token in OP_PARENTH:
                parenthesies_contents_stack.append(0)
                if len(ops_list) > 0 and ops_list[-1] in CL_PARENTH:
                    # back to back parenthesies, insert an AND
                    ops_list.append(",")
                ops_list.append("(")
                open_parenthesies_counter += 1
            elif token in CL_PARENTH:
                if open_parenthesies_counter <= 0:
                    self.modifications_logger.warning("unmatched closing parenthesies in requisites. Ignored.")
                else:
                    open_parenthesies_counter -= 1
                    contents = parenthesies_contents_stack.pop()
                    if contents == 0:
                        # empty parenthesies block, remove it.
                        while ops_list[-1] not in OP_PARENTH:
                            ops_list.pop()
                        ops_list.pop()  # remove "("
                        continue
                    else:
                        parenthesies_contents_stack[-1] += 1
                        if ops_list[-1] in ANDS or ops_list[-1] in ORS:
                            # if a parenthesies block has a tailing operator inside, remove it.
                            # For example "(CSC108H1 / or equivalent)" will be parsed as ["(","CSC108H1","/",")"]
                            # but we want ["(","CSC108H1",")"]
                            ops_list.pop()
                        ops_list.append(")")
            elif token in ANDS:
                if len(ops_list) == 0:
                    continue
                elif ops_list[-1] in ANDS + ORS:
                    ops_list.pop()
                    ops_list.append(",")
                elif ops_list[-1] in OP_PARENTH:
                    continue
                else:
                    ops_list.append(",")
            elif token in ORS:
                if len(ops_list) == 0:
                    continue
                elif ops_list[-1] in ANDS + ORS:
                    ops_list.pop()
                    ops_list.append("/")
                elif ops_list[-1] in OP_PARENTH:
                    continue
                else:
                    ops_list.append("/")
            elif self.course_code_parser(token) is not None:
                if len(ops_list) > 0 and ops_list[-1] not in OP_PARENTH + ANDS + ORS:
                    self.modifications_logger.warning("inserted an OR during interpretation")
                    ops_list.append("/")
                ops_list.append(token)
                parenthesies_contents_stack[-1] += 1
        if len(ops_list) > 0 and (ops_list[-1] in ANDS or ops_list[-1] in ORS):
            # remove tailing and/or operators
            # For example "MAT135H1 / or equivalent" will be parsed as ["MAT135H1","/"]
            # but we want just ["MAT135H1"]
            ops_list.pop()
        # close open parenthesies, if any
        while open_parenthesies_counter > 0:
            self.modifications_logger.warning("unclosed opening parenthesis. Auto closed at the end.")
            ops_list.append(")")
            open_parenthesies_counter -= 1
        return ops_list

    def naive_requisites_parser(self, requisites_raw_list: list[str]) -> tuple[list[str], set[str]]:
        """
        In case the requisite notation is confusing,
        one can naively extract everything that looks like a couse code, assume it is one
        and output under one big AND list.
        """
        output = ["AND"]
        for req in requisites_raw_list:
            if self.course_code_parser(req) is not None:
                output.append(req)
        return output, set()

    def requisites_to_polish_notation(self, ops_list: list[str]) -> list:
        """
        Convert requirements scrapped list to Reverse Polish Notation
        https://en.wikipedia.org/wiki/Reverse_Polish_notation
        based on
        https://en.wikipedia.org/wiki/Shunting_yard_algorithm

        Assumes parenthesies are matched, and only symbols are ,/() and course codes

        A, B / C, D => ["A", "B", "C", "/" "," "D" ","]
        """
        output = []
        ops_stack = []
        i = 0
        while i < len(ops_list):
            item = ops_list[i]
            if item in ANDS:
                while len(ops_stack) != 0 and ops_stack[-1] in ORS:
                    output.append(ops_stack.pop())
                ops_stack.append(",")
            elif item in ORS:
                ops_stack.append("/")
            elif item in OP_PARENTH:
                ops_stack.append("(")
            elif item in CL_PARENTH:
                while len(ops_stack) > 0 and ops_stack[-1] not in OP_PARENTH:
                    output.append(ops_stack.pop())
                if len(ops_stack) > 0:
                    ops_stack.pop()  # remove "("
            else:
                output.append(item)
            i += 1
        while len(ops_stack) > 0:
            output.append(ops_stack.pop())
        return output

    def requisites_pn_to_nested_lists(self, requisites_pn: list[str]) -> list:
        """
        Convert Reverse Polish Notation to nested lists
        ["A" "B" "," "C" "D" "/" ","] -> ["AND" ["AND" "A" "B"] [ "OR" "C" "D"]]
        Note that it preserves the order of elements.
        """
        if len(requisites_pn) == 0:
            return []
        operations = ["/", "OR", ","]
        op_map = {"/": "OR", "OR": "OR", ",": "AND"}
        i = 0
        output_stack = []
        missing_ops_counter = 0
        while i < len(requisites_pn):
            item = requisites_pn[i]
            if item in operations:
                if len(output_stack) < 2:
                    missing_ops_counter += 1
                else:
                    item1 = output_stack.pop()
                    item2 = output_stack.pop()
                    temp = [op_map[item], item2, item1]
                    output_stack.append(temp)
            else:
                output_stack.append(item)
            i += 1
        if missing_ops_counter > 0:
            self.general_logger.critical(
                "more operators=%s than available arguments: %s", missing_ops_counter, requisites_pn
            )

        # remove outer wrappers if there are any.
        while len(output_stack) == 1 and isinstance(output_stack, list) and isinstance(output_stack[0], list):
            output_stack = output_stack[0]
        return output_stack

    def nested_lists_flattener(self, input_list: list) -> list:
        """
        Return flattened version of requisites nested lists to be more shallow.
        (Creates new copy, no mutation)
        ["AND" ["AND" "A" "B"] "C"] -> ["AND" "A" "B" "C"]
        ["AND" ["OR" "A" "B"] "C"] -> ["AND" ["OR" "A" "B"] "C"]
        """
        output: list[list | str] = []
        assert isinstance(input_list, list)

        if len(input_list) == 0:
            return []
        if len(input_list) == 1 and isinstance(input_list[0], list):
            input_list = input_list[0]  # handle case where there is an extra outer wrapper
            output = self.nested_lists_flattener(input_list)
            assert output[0] in ["AND", "OR"]
            return output

        if len(input_list) == 1 and isinstance(input_list[0], str):
            assert input_list[0] not in ["AND", "OR"]
            output = ["AND", input_list[0]]
            assert output[0] in ["AND", "OR"]
            return output

        operation = input_list[0]
        if operation not in ["AND", "OR"]:
            input_list.insert(0, "AND")
            operation = input_list[0]
        assert operation in ["AND", "OR"]

        assert len(output) == 0
        output.append(operation)

        for i in range(1, len(input_list)):
            if isinstance(input_list[i], list):
                flattened = self.nested_lists_flattener(input_list[i])
                assert flattened[0] in ["AND", "OR"]
                if flattened[0] == operation:
                    output += flattened[1:]
                else:
                    output.append(flattened)
            elif isinstance(input_list[i], str):
                output.append(input_list[i])
        assert output[0] in ["AND", "OR"]

        return output

    def previous_course_codes_parser(self, previous_course_codes_string: str) -> list[str]:
        """
        Some courses had different course codes in the past.
        Extract previous course codes from previous course codes string.
        """
        collector = ""
        output = []
        for c in previous_course_codes_string:
            if c.isdigit() or c.isalpha():
                collector += c
            else:
                if self.course_code_parser(collector) is not None:
                    output.append(collector)
                collector = ""
        if self.course_code_parser(collector) is not None:
            output.append(collector)
        return output

    def split_curse_name(self, course_name: str) -> tuple[str, str]:
        """
        Take the course name string of the format "MAT137Y1 - Calculus 1"
        and split it on the dash.
        The input could contain unicode characters, hence the hassle.
        """
        collections = []
        collector = ""
        for char in course_name:
            if char in SEPARATORS:
                if len(collector) > 0:
                    collections.append(collector)
                    collector = ""
            else:
                collector += char
        if len(collector) > 0:
            collections.append(collector)
            collector = ""

        course_code = collections[0]
        title = " ".join(collections[1:])
        if len(course_code) == 0 or self.course_code_parser(course_code) is None:
            self.general_logger.critical("course has no code")
        if len(title) == 0:
            self.general_logger.critical("course has no title")
        return course_code, title

    def course_bs4_to_dict(self, div: bs4.PageElement | bs4.Tag) -> tuple[dict, str]:
        """
        Convert a Beautifulsoup object corresponding to the HTML element containing a course, into a dictionary.
        Return the dictionary and a string "accept" or "discard"
        to the caller function about whether to accept the output.
        """
        # handle courses with empty body

        has_fields = []
        # course name
        raw_name = div.h3.div.string.strip()
        course_code, title = self.split_curse_name(raw_name)
        split_course_code = self.course_code_parser(course_code)
        assert split_course_code is not None
        self.current_course = course_code

        # This block must be below the title parsing, to make sure the course code is caught.
        # the course code will always be there. (I hope)
        body = div.find(class_='views-row')
        if body.contents == ["\n"]:
            self.modifications_logger.warning("discarded because it has no html body, thus no information")
            self.current_course = ""
            return {}, "discard"

        assert all(
            all(c in UNEXPECTED_FIELDS_CATCHER for c in tag.attrs['class'])
            for tag in div.find_all(True) if 'class' in tag.attrs
        )

        # ==== Previous Course Codes ====
        previous_course_codes = []  # Example: WRR414H1
        previous_course_codes_raw = div.find_all(class_="views-field-field-previous-course-number")
        if len(previous_course_codes_raw) > 0:
            previous_course_codes = self.previous_course_codes_parser(
                list(previous_course_codes_raw[0].strings)[1].strip()
            )
            has_fields.append("previous_course_codes")
            # assert course_code_parser(previous_course_code) is not None
            for pcc in previous_course_codes:
                if self.course_code_parser(pcc) is None:
                    self.general_logger.info("previous course code has strange format: %s", pcc.encode())

        # ==== Description ====
        description_raw = div.find_all(class_="views-field-body")
        description = ""
        if len(description_raw) > 0:
            description = "".join(description_raw[0].p.strings).strip()
            # ^ this join is necessary to deal with <strong></strong> tags being used in the description.
            if len(description_raw) > 1:
                self.general_logger.warning("course has multiple descriptions")
        else:
            # Example of course with no description: HIS357Y0
            self.modifications_logger.warning("course without description was discarded")
            self.current_course = ""
            return {}, "discard"

        hours_raw = div.find_all(class_="views-field-field-hours")
        hours = {"lecture": 0, "tutorial": 0, "practical": 0, "seminar": 0}
        if len(hours_raw) > 0:
            hours = self.hours_parser(hours_raw[0].span.string.strip())
            has_fields.append("hours")
            if len(hours_raw) > 1:
                self.general_logger.warning("course has multiple hour fields")
        else:
            # Example of course with no hours: ACT391H1 (internship)
            pass

        breadth_requirements_raw = div.find_all(
            class_="views-field-field-breadth-requirements"
        )
        breadth_requirements_list = []
        if len(breadth_requirements_raw) > 0:
            requirement_string = breadth_requirements_raw[0].span.string
            has_fields.append("breadth_requirements_list")
            breadth_requirements_list = [
                br for br in BREADTH_STRINGS if br in requirement_string
            ]  # We can't split by comma, because one of the BRs has a comma

            # assertain we aren't missing anything severely.
            assert len(requirement_string) - sum([len(br) for br in breadth_requirements_list]) < 30

        experience_raw = div.find_all(class_="views-field-field-course-experience")
        experience = ""
        if len(experience_raw) > 0:  # only around 50 courses have an experience field
            has_fields.append("experience")
            experience = experience_raw[0].span.string
        else:
            # no experience field is normal for most courses
            pass

        # CR / NCR check
        cr_ncr_eligible = True
        if re.search(CR_NCR_REGEX_PATTERN, description) is not None:
            cr_ncr_eligible = False
        elif "For CR/NCR only." in description:  # Example: For CR/NCR only. (RSM489H1 is only such example)
            # we will treat this as regular
            self.modifications_logger.warning("a 'For CR/NCR only' course. Will be treated as regular.")
            cr_ncr_eligible = True
        elif "CR/NCR" in description and cr_ncr_eligible:
            self.general_logger.warning("CR/NCR undetected situation")

        # ==== Pre and Co-requisites; and Exclusions ====
        prerequisites = []
        corequisites = []
        prerequisite_original = ""
        prerequisites_raw = div.find_all(class_="views-field-field-prerequisite")
        if len(prerequisites_raw) > 0:
            if len(prerequisites_raw) > 1:
                self.general_logger.warning("multiple prerequisite fields")
            prerequisite_original = "".join(prerequisites_raw[0].strings)
            structure = self.requisites_parser(
                prerequisite_original
            )
            prerequisites = structure
            has_fields.append("prerequisites")

        corequisites_raw = div.find_all(class_="views-field-field-corequisite")
        corequisites_original = ""
        if len(corequisites_raw) > 0:
            if len(corequisites_raw) > 1:
                self.general_logger.warning("multiple corequisite fields")
            corequisites_original = "".join(corequisites_raw[0].strings)
            structure = self.requisites_parser(
                corequisites_original
            )
            corequisites = structure
            has_fields.append("corequisites")

        exclusions = []
        exclusions_original = ""
        exclusions_raw = div.find_all(class_="views-field-field-exclusion")
        if len(exclusions_raw) > 0:
            if len(exclusions_raw) > 1:
                self.general_logger.warning("multiple prerequisite fields")
            exclusions_original = "".join(exclusions_raw[0].strings)
            structure = self.requisites_parser(
                exclusions_original
            )
            exclusions = structure
            has_fields.append("exclusions")

        recommended_prep = []   # Example: WRR317H1
        recommended_prep_raw = div.find_all(class_="views-field-field-recommended")
        if len(recommended_prep_raw) > 0:
            has_fields.append("recommended_prep")
            recommended_prep = list(recommended_prep_raw[0].strings)[1]

        self.current_course = ""  # reset current course context
        course_information = {
            "title": title,
            "course_code": course_code,
            "split_course_code": split_course_code,
            "previous_course_code": previous_course_codes,
            "description": description,
            "cr_ncr_eligible": cr_ncr_eligible,
            "breadth_requirements_list": breadth_requirements_list,
            "hours": hours,
            "prerequisites": prerequisites,
            "prerequisites_original": prerequisite_original,
            "corequisites": corequisites,
            "corequisites_original": corequisites_original,
            "exclusions": exclusions,
            "exclusions_original": exclusions_original,
            "experience": experience,
            "recommended_prep": recommended_prep,
            "has_fields": has_fields,  # whether fields were there, but were
                                       # interprted as emtpy, or did not exist in the records
        }
        return course_information, "accept"

    def page_to_json(self, page: int = 0, target_name: str = "") \
            -> list[dict]:
        """
        Take an HTML page and parse all courses in it. Return the parsed courses, and their number.
        """
        scrape_filename = SCRAPE_FOLDER + PARSING_TARGETS[target_name]['filepattern'].replace("PAGENUMBER", str(page))
        if not os.path.isfile(scrape_filename):
            self.general_logger.critical("%s does not exist", scrape_filename)
            return []
        with open(scrape_filename, "r", encoding='utf-8') as f:
            html_doc = f.read()

        soup = bs4.BeautifulSoup(html_doc, self.bs4_prefered_parser)

        if soup is None:
            raise ValueError("BeautifulSoup instance ended up None.")

        # Do the actual parsing
        course_list = soup.find(class_="view-content")
        if course_list is None:
            self.general_logger.critical("Warning: Couldn't find view-content in html.")
            return []
        courses_html = course_list.children
        courses_json = []
        for child in courses_html:
            if child != "\n":
                self.counters['courses_parsed'] += 1
                parsed_child, instruction = self.course_bs4_to_dict(child)
                if instruction == "accept":
                    self.counters['courses_accepted'] += 1
                    courses_json.append(parsed_child)
        return courses_json

    def save_to_json(self, courses: list[dict], filepath: str = "../data/courses.json") -> None:
        """Save a list containing dictionaries of course objects into a json file."""
        # create data folder if it doesn't exist already
        if not os.path.isdir(SAVE_FOLDER):
            os.mkdir(SAVE_FOLDER)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(courses, f, indent=2)
        self.general_logger.info("courses saved to %s", filepath)
        self.general_logger.info("Final file size: %sKiB", os.path.getsize(filepath) // 1024)

    def target_selection_ui(self) -> str:
        """
        Creates a simple dialogue to help user select parsing target.
        Returns the selected parsing target, default target is UTSG.
        """
        target = "UTSG"
        print(
            """Select Scrapping Target:
            (1) UTSG ArtSci - defaults
            (2) UTSC
            (3) UTM"""
        )
        selection = input("Enter>").strip()
        if selection.isdigit() and 1 <= int(selection) <= 3:
            target = ["UTSG", "UTSC", "UTM"][int(selection) - 1]
        else:
            print("selection interpreted as default.")
        return target

    def simplify_requisite(self, requisites: list, valid_course_codes: set[str], depth: int = 0) -> list | str:
        """
        Mutates requisite in place to remove all unnencessary courses. (eg. UTM courses)
        Assumes the requisites have already been processed by list flattener etc.
        """
        assert len(requisites) >= 2
        assert requisites[0] in ["AND", "OR"]
        operator = requisites[0]
        output = [operator]
        i = 1
        while i < len(requisites):
            item = requisites[i]
            if isinstance(item, str):
                # add if a course is valid, and also make sure there are no duplicates.
                # Example of course with duplicate: DRM300Y1
                if item in valid_course_codes and item not in output:
                    output.append(item)
            elif isinstance(item, list):
                out = self.simplify_requisite(item, valid_course_codes, depth + 1)
                if len(out) > 0:
                    output.append(out)
            i += 1

        assert len(output) > 0
        if len(output) == 1:
            assert output[0] in ["AND", "OR"]
            return []
        elif depth != 0 and len(output) == 2:
            assert output[0] in ["AND", "OR"]
            return output[1]
        elif depth == 0 and len(output) == 2 and isinstance(output[1], list):
            assert output[0] in ["AND", "OR"]
            assert output[1][0] in ["AND", "OR"]
            return self.nested_lists_flattener(output[1])
        else:
            return output

    def clean_requisites(self) -> None:
        """
        Go through all courses' requisites, and remove unknown course codes (or codes from other campuses.)
        For example, when only UTSG is scrapped, MAT157Y5 (UTM) will be removed.
        """
        valid_course_codes = {c["course_code"] for c in self.courses}
        for course in self.courses:
            self.current_course = course["course_code"]
            self_invalid = valid_course_codes - {course["course_code"]}
            # 14 courses or so, refer to themselves in their requisites eg. CSC240. We want to avoid picking that up.
            if len(course["prerequisites"]) > 0:
                course["prerequisites"] = self.simplify_requisite(course["prerequisites"], self_invalid)
            if len(course["corequisites"]) > 0:
                course["corequisites"] = self.simplify_requisite(course["corequisites"], self_invalid)
            if len(course["exclusions"]) > 0:
                course["exclusions"] = self.simplify_requisite(course["exclusions"], self_invalid)
            self.current_course = ""

    def full_parse(self, target: str = "UTSG", interactive: bool = True) -> None:
        """
        Parse all pages of a particular target, and store data to SAVE_PATH in json format.

        Preconditions:
            - target in PARSING_TARGETS
        """
        # help user select parsing target
        if interactive:
            target = self.target_selection_ui()

        start = time.clock_gettime(time.CLOCK_MONOTONIC)

        self.counters = {
            "courses_parsed": 0,
            "courses_accepted": 0,
            "requisite_parsings": 0
        }
        self.courses = []
        assert target in PARSING_TARGETS
        target_page_range = PARSING_TARGETS[target]['page_range']
        for p in target_page_range:
            if (p % (len(target_page_range) // 10)) == 0:
                self.general_logger.info("%s%% Done", round(p / len(target_page_range) * 100, 1))
            page_courses = self.page_to_json(p, target)
            self.courses.extend(page_courses)
        self.general_logger.info("parsed %s courses of which %s accepted", self.counters['courses_parsed'],
                                 self.counters['courses_accepted'])
        self.general_logger.info("Starting to remove unknown courses from requisites.")
        self.clean_requisites()
        self.general_logger.info("Finished removing unknown courses from requisites.")
        self.save_to_json(self.courses)
        end = time.clock_gettime(time.CLOCK_MONOTONIC)
        self.general_logger.info("parsing finished in: %ss", round(end - start, 4))


if __name__ == "__main__":
    import python_ta

    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': ['requests', 're', 'time', 'os', "logging", "typing", "contextvars", "json", "bs4"],
        'allowed-io': ['CourseParser.save_to_json', 'CourseParser.full_scrape_parse', "CourseParser.page_to_json",
                       "CourseParser.target_selection_ui"],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-statements': 100,
        'max-locals': 40,
        'max-branches': 35,
        'max-args': 7
    })

    course_parser = CourseParser()
    course_parser.full_parse()
