import os
import json

SCRAPES_FOLDER = 'ttb_scrapes'

if not os.path.isdir(SCRAPES_FOLDER):
    raise FileNotFoundError(f"Folder SCRAPES_FOLDER={SCRAPES_FOLDER} not found!")

FILELIST = os.listdir('ttb_scrapes')

def aggregate_mentioned_courses(filelist):
    mentioned_courses = set()
    for i, file in enumerate(FILELIST):
        # print(file, i)
        with open(f"ttb_scrapes/{file}", 'r') as f:
            content = f.read()
            if len(content) == 0:
                print("Warning")
            else:
                data = json.loads(content)
                mentioned_courses.update([c["code"] for c in data["pageableCourse"]["courses"]])
    return mentioned_courses

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