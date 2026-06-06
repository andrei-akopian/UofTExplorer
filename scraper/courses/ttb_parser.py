import os
import json

SCRAPES_FOLDER = "scraper/courses/ttb_scrapes"
SAVE_FILEPATH = "scraper/data/ttb_courses.json"
INSTRUCT_TYPES = ["LEC", "TUT", "PRA"]


def aggregate_mentioned_courses(filelist=None):
    if not os.path.isdir(SCRAPES_FOLDER):
        raise FileNotFoundError(f"Folder SCRAPES_FOLDER={SCRAPES_FOLDER} not found!")
    if filelist is None:
        filelist = os.listdir(SCRAPES_FOLDER)
    mentioned_courses = set()
    for i, file in enumerate(filelist):
        # print(file, i)
        with open(f"ttb_scrapes/{file}", "r") as f:
            content = f.read()
            if len(content) == 0:
                print("Warning")
            else:
                data = json.loads(content)
                mentioned_courses.update(
                    [c["code"] for c in data["pageableCourse"]["courses"]]
                )
    return mentioned_courses


def getBasicCourseInfo(filelist=None) -> dict[str, dict]:
    """
    Return dict of courses and their total class sizes.
    """
    if not os.path.isdir(SCRAPES_FOLDER):
        raise FileNotFoundError(f"Folder SCRAPES_FOLDER={SCRAPES_FOLDER} not found!")
    if filelist is None:
        filelist = os.listdir(SCRAPES_FOLDER)
    courses = dict()
    for i, file in enumerate(filelist):
        # print(file, i)
        with open(f"{SCRAPES_FOLDER}/{file}", "r") as f:
            content = f.read()
            if len(content) == 0:
                print("Warning, empty page encountered.")
            else:
                data = json.loads(content)
                for c in data["pageableCourse"]["courses"]:
                    cc = c["code"]
                    if cc not in courses:
                        filldict = gatherCourseEnrollmentNumbers(c)
                        courses[cc] = filldict
                    else:
                        # For now just crudely add on top
                        gatherCourseEnrollmentNumbers(c, courses[cc])
    return courses


def gatherCourseEnrollmentNumbers(c, filldict=None) -> dict:
    if filldict is None:
        filldict = dict()
        filldict["capacityByInstructType"] = {k: 0 for k in INSTRUCT_TYPES}
    for s in c["sections"]:
        tm = s["teachMethod"]
        assert tm in filldict["capacityByInstructType"]
        me = s["maxEnrolment"]
        assert isinstance(me, int)
        filldict["capacityByInstructType"][tm] += me
    return filldict


def full_parse():
    info = getBasicCourseInfo()
    with open(SAVE_FILEPATH, "w", encoding="utf-8") as f:
        json.dump(info, f, indent=2)
