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
import os
import time
import logging
import json
import bs4

SAVE_FOLDER: str = "../data/"
SAVE_FILENAME: str = "programs.json"
SAVE_PATH = SAVE_FOLDER + SAVE_FILENAME
SCRAPE_FOLDER = "../scraper/raw_output/"
PARSING_TARGETS: dict[str, dict] = {
    "UTM": {
        "filepattern": "programs_page_PAGENUMBER_utm.html",
        "page_range": range(0, 5 + 1)
    },
    "UTSG": {
        "filepattern": "programs_page_PAGENUMBER_utsg.html",
        "page_range": range(0, 12 + 1)
    },
    "UTSC": {
        "filepattern": "programs_page_PAGENUMBER_utsc.html",
        "page_range": range(0, 7 + 1)
    },
}


class ContextFilter(logging.Filter):
    """Context filter for the logger."""
    parent: ProgramParser

    def __init__(self, parent: ProgramParser) -> None:
        self.parent = parent
        super().__init__()

    def filter(self, record: logging.LogRecord) -> bool:
        """Custom filter for the logger. Adds the current program to the logging."""
        record.current_program = self.parent.current_program
        return True


class ProgramParser:
    """
    Class that contains all methods and code necessary to the program HTMLs.

    Instance Attributes:
        - logger: logger that logs important events and problems during parsing
        - programs: list of all programs the program parser has parsed
        - programs_parsed: programs the parser has attempted parsing
        - programs_accepted: programs the parser parsed and kept
        - current_program: the title of the program the parser is currently processing. Needed for logger.
    """
    logger: logging.Logger
    programs: list[dict]
    programs_parsed: int
    programs_accepted: int
    current_program: str

    def __init__(self, log_to_file: bool = False) -> None:
        self.current_program = ""
        self.logger = logging.getLogger(__name__)
        self.logger.addFilter(ContextFilter(self))
        if log_to_file:
            handler: logging.Handler = logging.FileHandler("./parser_logs/program_parser.log", mode="w")
        else:
            handler: logging.Handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(levelname)s %(current_program)s | %(message)s"))
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)

        self.programs_parsed = 0
        self.programs_accepted = 0
        self.programs = []

    def program_code_parser(self, program_code: str) -> list[str]:
        """
        Dilutes the program code into its prime components.
        No department information, surprisingly.

        The Program codes have the folloing format:
        AS (stands for artsci)
        3 letters indicating  major / minor / spec / focus / cert
        4 digit program number
        1 digit suffix for cases where thye apparently run out of codes for a department.

        For example: ASMAJ1689 is CS major
        """
        artsci = program_code[0:2]
        if artsci != "AS":
            self.logger.critical("Program title does not start with artsci. %s", program_code)
        program_type = program_code[2:5]  # major / minor / spec / focus / cert
        if program_type not in ["MAJ", "MIN", "SPE", "FOC", "CER"]:
            self.logger.critical("Program does not have major specification. %s", program_code)
        program_number = program_code[5:9]  # 4 digit number
        if not program_number.isdigit():
            self.logger.critical("Program number has strange number format. %s", program_code)
        suffix = program_code[9:]  # they ran out of numbers, this is the fix :\
        if not (len(suffix) == 0 or suffix.isalpha()):
            self.logger.critical("Unexpected program sufix. %s", program_code)
        # Example: https://artsci.calendar.utoronto.ca/section/Computer-Science
        return [artsci, program_type, program_number, suffix]

    def program_bs4_to_dict(self, div: bs4.PageElement | bs4.Tag) -> tuple[dict, str]:
        """
        Take beautiful soup object corresponding to a programs's section in the HTML page,
        and extract all relevant data.
        """
        review_flags = []
        # course name
        raw_name = div.h3.div.string.strip()
        self.current_program = raw_name
        split_temp = raw_name.split(" - ")
        program_code: list[str] = []
        title: str = "Missing Program Title"
        if len(split_temp) == 1:
            # example: Focus in Green Chemistry
            # there are only like 5 of them
            self.logger.info("no program code. Discarded.")
            self.current_program = ""
            return {}, "discard"  # Drop programs with no program code
        elif len(split_temp) == 2:
            title = split_temp[0]
            program_code = self.program_code_parser(split_temp[1])
        elif len(split_temp) == 3:
            # example: Criminology and Sociolegal Studies - Major (Arts Program) - ASMAJ0826
            title += f"{split_temp[0]} - {split_temp[1]}"
            program_code = self.program_code_parser(split_temp[2])

        field_section_raw = div.find_all(class_="views-field-field-section-link")
        field_section = ""
        if len(field_section_raw) > 0:
            field_section = field_section_raw[0].find("a").string

        description_raw = div.find_all(class_="view-field-body")
        description = ""
        if len(description_raw) > 0:
            description = description_raw[0].strings

        enrollment_requirements_raw = div.find_all(
            class_="views-field-field-enrolment-requirements"
        )
        enrollment_requirements = []
        if len(enrollment_requirements_raw) > 0:
            p_tags = enrollment_requirements_raw[0]
            for p_tag in p_tags:
                enrollment_requirements.append(p_tag.string)

        completion_requirements_raw = div.find_all(
            class_="views-field-field-completion-requirements"
        )
        completion_requirements = []
        courses_mentioned = []
        if len(completion_requirements_raw) > 0:
            p_tags = completion_requirements_raw[0]
            for p_tag in p_tags:
                # completion_requirements.append(p_tag.string)
                a_tags = p_tag.find_all("a")
                for a_tag in a_tags:
                    course_name = a_tag.string
                    if course_name != "CR/NCR":
                        courses_mentioned.append(course_name)

        program_information = {
            "title": title,
            "program_code": program_code,
            "field_section": field_section,
            "description": description,
            "enrollment_requirement": enrollment_requirements,
            "completion_requirement": completion_requirements,
            "courses_mentioned": courses_mentioned,
            "review_flags": review_flags,
        }
        self.current_program = ""
        return program_information, "accept"

    def page_to_json(self, page: int, target_name: str) -> list[dict]:
        """
        Take a program HTML and parse out all data from it into JSON format.
        """
        scrape_filename = SCRAPE_FOLDER + PARSING_TARGETS[target_name]['filepattern'].replace("PAGENUMBER", str(page))
        if not os.path.isfile(scrape_filename):
            self.logger.critical("%s does not exist", scrape_filename)
            return []
        with open(scrape_filename, "r", encoding='utf-8') as f:
            html_doc = f.read()

        soup = bs4.BeautifulSoup(html_doc, "html.parser")
        course_list = soup.find(class_="view-content")
        if course_list is None:
            self.logger.critical("Couldn't find view-content in html. page=%s", page)
            return []
        programs_html = course_list.children
        # reset
        for child in programs_html:
            if child != "\n":
                self.programs_parsed += 1
                parsed_child, instruction = self.program_bs4_to_dict(child)
                if instruction == "accept":
                    self.programs.append(parsed_child)
                    self.programs_accepted += 1
            else:
                pass
        return self.programs

    def save_to_json(self, programs: list[dict], filepath: str = SAVE_PATH) -> None:
        """
        Save a dictionary containing programs and their properties to a JSON file.
        """
        # create data folder if it doesn't already exist
        if not os.path.isdir(SAVE_FOLDER):
            os.mkdir(SAVE_FOLDER)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(programs, f, indent=2)
        self.logger.info("Programs saved to %s", filepath)
        self.logger.info("Final file size: %s KiB", os.path.getsize(filepath) // 1024)

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
            self.logger.info("selection interpreted as default %s", target)
        return target

    def full_scrape_parse(self, target: str = "UTSG", interactive: bool = True) -> None:
        """
        Parse all the pages associate with programs and a particular target.
        """
        if interactive:
            target = self.target_selection_ui()

        start = time.clock_gettime(time.CLOCK_MONOTONIC)
        self.programs = []
        self.programs_accepted = 0
        self.programs_parsed = 0
        target_page_range = PARSING_TARGETS[target]['page_range']
        for p in target_page_range:
            if (p % (len(target_page_range) // 10)) == 0:
                self.logger.info("%s %% Done", round(p / len(target_page_range) * 100, 1))
            self.page_to_json(p, target)
        self.logger.info("parsed %s programs of which %s were kept",
                         self.programs_parsed, self.programs_accepted
                         )
        self.save_to_json(self.programs)
        end = time.clock_gettime(time.CLOCK_MONOTONIC)
        self.logger.info("parsing finished in: %ss", round(end - start, 4))


if __name__ == "__main__":
    program_parser = ProgramParser()
    program_parser.full_scrape_parse()

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': ["bs4", "json", "os", "time", "logging"],
        'allowed-io': ['ProgramParser.save_to_json', "ProgramParser.target_selection_ui", "ProgramParser.page_to_json"],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 30,
        'max-branches': 15,
        'max-args': 7
    })
