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
    logging.warning(
        f"{RAW_DIR} should exist, parsing without it is pointless. Maybe reorder imports?"
    )
    os.makedirs(LOG_DIR)

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/program_areas_parser.log"),
        logging.StreamHandler(),
    ],
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
    with open("scraper/data/program_areas.json", "w") as f:
        json.dump(outputs, f, indent=2)


def prase_program_list(programs_html):
    programs_list = []
    for child in programs_html:
        if child != "\n":
            name_tag = child.div
            if name_tag is None:
                print(name_tag, child)
            program_title = name_tag.string.strip()
            split_temp = program_title.split(" - ")
            program_artsci = None
            if len(split_temp) == 1:
                # example: Focus in Green Chemistry
                # there are only like 5 of them
                logging.info(f"{split_temp} no program code. Discarded.")
            elif len(split_temp) == 2:
                program_code = program_code_parser(
                    split_temp[1].strip(), logger=logging
                )
            elif len(split_temp) == 3:
                # example: Criminology and Sociolegal Studies - Major (Arts Program) - ASMAJ0826
                program_code = program_code_parser(
                    split_temp[2].strip(), logger=logging
                )
            else:
                raise ValueError("not sure how to parse this")
            programs_list.append(program_code)
    return programs_list


def parse_course_list(courses_html):
    course_list = []
    if len(courses_html) > 0:
        for child in courses_html:
            if child != "\n":
                name_tag = child.div
                if name_tag is None:
                    print(name_tag)
                course_name = name_tag.string.strip()
                course_code, title = split_curse_name(
                    course_name=course_name, logger=logging
                )
                course_list.append(course_code)
    return course_list


def parse_program_area(i, loadpath):
    # TODO add self link to output, so we can provide links in the main apps.
    assert os.path.exists(loadpath)
    with open(loadpath, "r") as f:
        html_raw = f.read()
    soup = bs4.BeautifulSoup(html_raw, "html.parser")
    title_section = soup.find(class_="page-title")
    assert title_section is not None
    title = "".join(title_section.strings).strip()
    course_list = []
    programs_list = []
    assert len(title) > 0  # sanity check

    # now the program and course lists
    footer = soup.find("footer")  # course listings are in footer
    if footer is None:
        logging.info(f"{title} had no courses or programs {loadpath}")
        return {
            "title": title,
            "course_list": course_list,
            "programs_list": programs_list,
        }
    course_and_programs_divs = footer.findChildren("div", recursive=False)
    if not len(course_and_programs_divs) == 2:
        return {
            "title": title,
            "course_list": course_list,
            "programs_list": programs_list,
        }
    # assert len(course_and_programs_divs) == 2
    programs_view = course_and_programs_divs[0]
    course_view = course_and_programs_divs[1]

    # programs
    if (
        "view-programs-view" in programs_view["class"]
    ):  # sometimes no programs are listed
        programs_list_contents = programs_view.find("div", class_="view-content")
        if programs_list_contents is None:  # sometimes this also happens
            pass
        else:
            programs_html = []
            for child in programs_list_contents.findChildren(class_="view_row"):
                programs_html.append(child.h3)
            programs_list = prase_program_list(programs_html)
    else:
        assert any("prog" in c for c in programs_view["class"])
        program_groups = programs_view.find_all(class_="view-grouping")
        if len(program_groups) > 0:
            for group in program_groups:
                group_content = group.find(class_="view-grouping-content")
                programs_list.extend(
                    prase_program_list(group_content.findChildren("h3", limit=False))
                )
    # courses
    if "view-courses-view" in course_view["class"]:
        courses_html = list(course_view.find(class_="view-content").children)
        course_list.extend(parse_course_list(courses_html))
    else:
        course_groups = course_view.find_all(class_="view-grouping")
        if len(course_groups) > 0:
            for group in course_groups:
                group_content = group.find(class_="view-grouping-content")
                course_list.extend(parse_course_list(group_content.select("h3")))
        else:
            course_view_content = course_view.find(class_="view-content")
            if course_view_content is not None:
                course_list.extend(parse_course_list(course_view_content.select("h3")))
            else:
                logging.warning(f"No courses found in {loadpath} {title}")

    return {"title": title, "course_list": course_list, "programs_list": programs_list}


if __name__ == "__main__":
    parse_all_program_areas()
    pass
