"""
For scrapping https://ttb.utoronto.ca/
"""

import requests
import json
import time
import logging 
import os
import math

BASE_DOMAIN_NAME = "https://ttb.utoronto.ca/"
GET_PAGEABLE_COURSES = "https://api.easi.utoronto.ca/ttb/getPageableCourses"
PAGE_SIZE = 20
OUTPUT_DIR = "scraper/courses/ttb_scrapes"

# create a tree such that we use minimal requests to ttb
counter = 0
def create_tree(strlist, maxl=PAGE_SIZE, depth=0) -> dict | list:
    global counter
    if depth == 0:
        counter = 1
    else:
        counter += 1
    assert depth < 8  # was designed for lenght 8 course codes
    assert len({s[:depth] for s in strlist}) == 1 # they all have the same prefix
    if len(strlist) <= maxl:
        return strlist
    elif len(strlist) > maxl:
        keys = {s[depth] for s in strlist}
        d = dict()
        for key in keys:
            l = [s for s in strlist if s[depth] == key]
            if len(l) > maxl:
                l = create_tree(l, maxl, depth+1)
            d[key] = l
        return d

def get_optimal_queries(tree, prefix="") -> list:
    l = []
    for key in tree:
        if isinstance(tree[key], list):
            l.append(prefix+key)
        elif isinstance(tree[key], dict):
            l.extend(get_optimal_queries(tree[key], prefix+key))
    return l

def getPageableCourses(query: str, divisions=["ARTSC"], page: int = 1, verbose=True):
    request_data = {
        "courseCodeAndTitleProps":{
            # "courseCode": f"{query}",
            "courseCode": "",
            "courseSectionCode": "",
            "courseTitle": f"{query}",
            "searchCourseDescription": True
        },
        "departmentProps":[],
        "campuses":[],
        # "sessions":["20265F","20265S","20265"],
        # "sessions": [
        #     "20265",
        #     "20265S",
        #     "20265F",
        # ],
        "sessions":["20265F","20265S","20265","20269","20271","20269-20271"], # 2026 summer + next fall
        # "sessions": [f"202{y}{i}{f}" for y in ["5", "6", "7"] for i in range(0,10) for f in ["F", "S", ""]],
        # "sessions":["20259","20261","20259-20261"],
        "requirementProps":[],
        "instructor":"",
        "courseLevels":[],
        "deliveryModes":[],
        "dayPreferences":[],
        "timePreferences":[],
        # "divisions":["ARTSC","ERIN"],
        "divisions": divisions,
        "creditWeights":[],
        "availableSpace": False,
        "waitListable": False,
        "page": page,
        "pageSize":50,
        "direction":"asc"
    }
    if verbose:
        print(f"Sent POST request page={page}. Awaiting responds.")
    response = requests.post(
        url=f"{GET_PAGEABLE_COURSES}",
        json=request_data,
        headers={
            "Accept": "application/json, text/plain, */*"
        }
    )
    if verbose:
        print(f"Recieved response.")
    assert response.status_code == 200
    j = response.json()
    assert list(j.keys()) == ["payload", "status"] # has two keys, status and payload
    payload = j["payload"]
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(f"{OUTPUT_DIR}/{query}_{time.time_ns()}.json", "w") as f:
        json.dump(payload, f)
    return payload

def get_num_pages():
    payload = getPageableCourses("")
    total = payload["pageableCourse"]['total']
    pageSize = payload["pageableCourse"]['pageSize']
    pages = math.ceil(total / pageSize)
    return pages

def scrape_everything(pages=None):
    if pages is None:
        pages = get_num_pages()
    for page in range(0, pages):
        payload = getPageableCourses("", page=page)
        time.sleep(3)
        print(page, len(payload["pageableCourse"]['courses']))

if __name__ == "__main__":
    pass