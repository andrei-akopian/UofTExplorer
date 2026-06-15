import json
import os
import logging
from scraper.courses.course_parser import CourseParser
from core.constructor import construct_course_graph, construct_subgraph
from core.traversers import Targets

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SAVE_FOLDER = "data"
LOAD_FOLDER = "scraper/data"

# Datasets
CAL_COURSES_PATH = f"{LOAD_FOLDER}/courses.json"
TTB_COURSES_PATH = f"{LOAD_FOLDER}/ttb_courses.json"
GLOSSARY_PATH = f"{LOAD_FOLDER}/glossary.json"
PROGRAM_AREAS_PATH = f"{LOAD_FOLDER}/program_areas.json"
PROGRAMS_PATH = f"{LOAD_FOLDER}/programs.json"


def venn_diagram(ttb_courses: set[str], calendar_courses: set[str]):
    assert isinstance(ttb_courses, set)
    assert isinstance(calendar_courses, set)
    print("=Venn diagram of ttb and calendar course listings")
    print("\tcalendar total:", len(calendar_courses))
    print("\tttb total:", len(ttb_courses))
    print("\tcalendar exclusive:", len(calendar_courses - ttb_courses))
    print("\tttb exclusive:", len(ttb_courses - calendar_courses))
    print(
        "\tcalendar INTERSECTION ttb", len(ttb_courses.intersection(calendar_courses))
    )
    print("\tcalendar UNION ttb", len(ttb_courses.union(calendar_courses)))


def load_datasets():
    with open(CAL_COURSES_PATH, "r") as f:
        cal_courses = json.load(f)
    logger.info("Loaded cal courses.json")
    with open(TTB_COURSES_PATH, "r") as f:
        ttb_courses = json.load(f)
    logger.info("Loaded ttb_courses.json")
    with open(GLOSSARY_PATH, "r") as f:
        glossary = json.load(f)
    logger.info("Loaded glossary.json")
    with open(PROGRAM_AREAS_PATH, "r") as f:
        program_areas = json.load(f)
    logger.info("Loaded glossary.json")
    with open(PROGRAMS_PATH, "r") as f:
        programs = json.load(f)
    logger.info("Loaded glossary.json")
    return cal_courses, ttb_courses, programs, program_areas, glossary


def full_sync():
    os.makedirs(SAVE_FOLDER, exist_ok=True)

    cal_courses, ttb_courses, programs, program_areas, glossary = load_datasets()

    delete_stack = []
    course_codes = []
    for i, course in enumerate(cal_courses):
        # print(course)
        cc = course["course_code"]
        if cc not in ttb_courses:
            delete_stack.append(i)
        else:
            course["class_size"] = max(
                ttb_courses[cc]["capacityByInstructType"].values()
            )
            course_codes.append(cc)

    venn_diagram(set(ttb_courses.keys()), set(course_codes))

    logger.info(f"Deleting {len(delete_stack)}")
    while len(delete_stack) > 0:
        cal_courses.pop(delete_stack.pop())

    count_cal_missing = 0
    for key in ttb_courses.keys():
        if key not in course_codes:
            count_cal_missing += 1
    logger.warn(f"in ttb but missing from cal {count_cal_missing}")

    # clean unknown / redundant prerequisites
    parser = CourseParser()
    parser.courses = cal_courses
    parser.clean_requisites()
    cal_courses = parser.courses

    graph = construct_course_graph(filename="", data=cal_courses)
    for i, course in enumerate(cal_courses):
        subgraph = construct_subgraph(graph, [course["course_code"]], Targets(True, True, False, False))
        course["subgraph_num_courses"] = len(subgraph.courses)
        course["subgraph_num_requisites"] =  len(subgraph.requisites)

    savepath = f"{SAVE_FOLDER}/courses.json"
    with open(savepath, "w", encoding="utf-8") as f:
        json.dump(cal_courses, f, indent=2)
    logger.info(f"Saved to synthesized data to {savepath}.")
