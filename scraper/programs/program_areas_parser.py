import os
import time
import logging
import json
import bs4
from scraper.courses.course_utils import course_code_parser, split_curse_name
from scraper.programs.program_utils import program_code_parser

CACHE_DIR = "scraper/programs/cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
LIST_NAME = "areas.json"
LIST_PATH = f"{CACHE_DIR}/{LIST_NAME}"
LOG_DIR = "scraper/programs/logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)
RAW_DIR = "scraper/programs/raw_output"
if not os.path.exists(LOG_DIR):
    logging.warning(f"{RAW_DIR} should exist, parsing without it is pointless. Maybe reorder imports?")
    os.makedirs(LOG_DIR)

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/program_areas_parser.log"),
        logging.StreamHandler(),
    ]
)

TEXT_SWAPS = {"\u00a0": " ", "\xa0": " ", "\u2014": "-", "\u200b": "", "\u2019": "'"}


def parse_all_program_areas():
    i = 0
    loadpath = f"{RAW_DIR}/area_{i}.html"
    outputs = []
    while os.path.exists(loadpath):
        program_area_output = parse_program_area(i, loadpath)
        outputs.append(program_area_output)
        # next iter prep
        i += 1
        loadpath = f"{RAW_DIR}/area_{i}.html"
    with open("scraper/data/program_areas.json", "r") as f:
        json.dump(outputs, f, indent="2")

def parse_program_area(i, loadpath):
    assert os.path.exists(loadpath)
    with open(loadpath, "r") as f:
        html_raw = f.read()
    soup = bs4.BeautifulSoup(html_raw, "html.parser")
    title_section = soup.find(id="block-w3css-subtheme-page-title")
    assert title_section is not None
    title = title_section.find("h1").string
    assert len(title) > 0 # sanity check

    # now the program and course lists
    footer = soup.find("footer")  # course listings are in footer
    assert footer is not None

    programs_list_view = footer.find(class_="view-programs-view")
    programs_list = []
    if programs_list_view is not None:  # sometimes no programs are listed
        programs_list_contents = programs_list_view.find("div", class_="view-content")
        if programs_list_contents is None:  # sometimes this also happens
            pass
        else:
            programs_html = programs_list_contents.children

            for child in programs_html:
                if child != "\n":
                    program_title = child.h3.div.string.strip()
                    split_temp = program_title.split(" - ")
                    program_artsci = None
                    if len(split_temp) == 1:
                        # example: Focus in Green Chemistry
                        # there are only like 5 of them
                        logging.info(f"{split_temp} no program code. Discarded.")
                    elif len(split_temp) == 2:
                        program_code = program_code_parser(split_temp[1].strip())
                    elif len(split_temp) == 3:
                        # example: Criminology and Sociolegal Studies - Major (Arts Program) - ASMAJ0826
                        program_code = program_code_parser(split_temp[2].strip())
                    else:
                        raise ValueError("not sure how to parse this")
                    programs_list.append(program_code)

    courses_html = footer.find(class_="view-courses-view")
    if courses_html is None:
        courses_html = footer.find_all(class_="view-grouping")
    print(len(courses_html))
    course_list = []
    for child in courses_html:
        if child != "\n":
            name_tag = child.div
            if name_tag is None:
                print(name_tag)
            course_name = name_tag.string
            course_code, title = split_curse_name(course_name=course_name, logger=logging)
            course_list.append(course_code)
    return {
        "title": title,
        "course_list": course_list,
        "programs_list": programs_list
    }

if __name__ == "__main__":
    parse_all_program_areas()
    pass
