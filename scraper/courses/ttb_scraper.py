"""
For scrapping https://ttb.utoronto.ca/
"""

import requests
import json
import time
import logging 

BASE_DOMAIN_NAME = "https://ttb.utoronto.ca/"
GET_PAGEABLE_COURSES = "https://api.easi.utoronto.ca/ttb/getPageableCourses"
PAGE_SIZE = 20

def get_course_codes(path="../../data/courses.json"):
    # FIXME find some other source for course codes, this one is incomplete, some courses from ttb might not be comming up.
    with open("../../data/courses.json", "r") as f:
        course_data = json.load(f)
    course_codes = [c["course_code"] for c in course_data]
    assert {len(c) for c in course_codes} == {8} # they should all be length 8, otherwise below code breaks

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

if __name__ == "__main__":
    pass