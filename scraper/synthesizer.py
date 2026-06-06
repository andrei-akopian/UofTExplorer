import json
import os
import logging
from scraper.courses.course_parser import CourseParser

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SAVE_FOLDER = "data"
FILENAME = "courses.json"
SAVE_PATH = f"{SAVE_FOLDER}/{FILENAME}"

LOAD_FOLDER = "scraper/data"


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


def full_sync():
    os.makedirs(SAVE_FOLDER, exist_ok=True)

    with open(f"{LOAD_FOLDER}/courses.json", "r") as f:
        cal_courses = json.load(f)
    logger.info("Loaded cal courses.json")
    with open(f"{LOAD_FOLDER}/ttb_courses.json", "r") as f:
        ttb_courses = json.load(f)
    logger.info("Loaded ttb_courses.json")

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

    with open(SAVE_PATH, "w", encoding="utf-8") as f:
        json.dump(parser.courses, f, indent=2)
    logger.info(f"Saved to synthesized data to {SAVE_PATH}.")
