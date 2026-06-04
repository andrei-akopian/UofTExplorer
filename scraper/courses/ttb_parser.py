import os
import json

SCRAPES_FOLDER = 'ttb_scrapes'
INSTRUCT_TYPES = ["LEC", "TUT", "PRA"]

if not os.path.isdir(SCRAPES_FOLDER):
    raise FileNotFoundError(f"Folder SCRAPES_FOLDER={SCRAPES_FOLDER} not found!")

def aggregate_mentioned_courses(filelist=None):
    if filelist is None:
        filelist = os.listdir('ttb_scrapes')
    mentioned_courses = set()
    for i, file in enumerate(filelist):
        # print(file, i)
        with open(f"ttb_scrapes/{file}", 'r') as f:
            content = f.read()
            if len(content) == 0:
                print("Warning")
            else:
                data = json.loads(content)
                mentioned_courses.update([c["code"] for c in data["pageableCourse"]["courses"]])
    return mentioned_courses

def getBasicCourseInfo(filelist=None) -> dict[str, int]:
    """
    Return dict of courses and their total class sizes.
    """
    if filelist is None:
        filelist = os.listdir('ttb_scrapes')
    courses = dict()
    for i, file in enumerate(filelist):
        # print(file, i)
        with open(f"ttb_scrapes/{file}", 'r') as f:
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


def venn_diagram(ttb_courses: set[str], calendar_courses: set[str]):
    assert isinstance(ttb_courses, set)
    assert isinstance(calendar_courses, set)
    print("Venn diagram of ttb and calendar course listings")
    print("calendar total:", len(calendar_courses))
    print("ttb total:", len(ttb_courses))
    print("calendar exclusive:", len(calendar_courses - ttb_courses))
    print("ttb exclusive:", len(ttb_courses- calendar_courses))
    print("calendar INTERSECTION ttb", len(ttb_courses.intersection(calendar_courses)))
    print("calendar UNION ttb", len(ttb_courses.union(calendar_courses)))