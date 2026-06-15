"""
Wrapper on all scraping and parsing modules for easy usage.
"""

import scraper.synthesizer as synthesizer
from scraper.courses.course_parser import CourseParser
from scraper.courses.course_scraper import full_scrape as course_scrape
from scraper.courses.ttb_scraper import scrape_everything as ttb_scrape
from scraper.courses.ttb_parser import full_parse as ttb_parse
from scraper.programs.program_parser import ProgramParser
from scraper.programs.artsci_program_scraper import (
    full_scrape as full_scrape_artsci_programs,
)
from scraper.glossary.glossary_parser import parse_glossary
from scraper.glossary.glossary_scraper import scrape_glossary
import sys
from datetime import datetime
import os
import json

JOB_TYPES = [  # list, so I can iterate through it and parse in the right order
    # "glossary_scraper",
    # "glossary_parser",
    "program_scraper",
    "program_parser",
    "course_scraper",
    "course_parser",
    "ttb_scraper",
    "ttb_parser",
    "synthesizer",
]

JOB_RESOLVERS = {
    # "glossary_scraper": parse_glossary,  # glossary is pointless to scrape. we are using a custom made glossary now.
    # "glossary_parser": scrape_glossary,
    "program_scraper": full_scrape_artsci_programs,
    "program_parser": ProgramParser.get_parse_job(interactive=False),
    "course_scraper": course_scrape,
    "course_parser": CourseParser.get_parse_job(interactive=False),
    "ttb_scraper": ttb_scrape,
    "ttb_parser": ttb_parse,
    "synthesizer": synthesizer.full_sync,
}

OUTDATEDNESS_REPORT_PATH = "data/outdatedness_report.json"


def getYorN(text) -> bool:
    user = input(text)
    if len(user) == 0:
        return False
    else:
        return user[0].lower() == "y"


def run_job(punchcard):
    assert len(punchcard) == len(JOB_TYPES)
    for jt, p in zip(JOB_TYPES, punchcard):
        if p:
            JOB_RESOLVERS[jt]()


def scraperui():
    report_outdatedness()
    for jt in JOB_TYPES:
        if getYorN(f"Run {jt}? [y/(n)]:"):
            JOB_RESOLVERS[jt]()


def report_outdatedness(save=True):
    today = datetime.today()
    print(
        f"= Scrape outdatedness report {today}: (note, negative results are shown, what wasn't mentioned, wasn't checked.)"
    )
    # courses
    paths = {
        "scraper/courses/raw_output": 0,
        "scraper/courses/ttb_scrapes": 0,
        "scraper/programs/raw_output": 0,
        "scraper/data/courses.json": 0,
        "scraper/data/ttb_courses.json": 0,
        "data/courses.json": 0,
        "data/programs.json": 0,
        "data/glossary.json": 0,
    }
    for p in paths:
        if not os.path.exists(p):
            print(f"{p} does not exist")
        else:
            mts = os.path.getmtime(p)
            mtime = datetime.fromtimestamp(mts)
            delta = today - mtime
            print(
                p,
                "last modified:\n\t",
                mtime,
                f"({delta} ago)",
            )
            paths[p] = mts
    if save:
        if os.path.exists(OUTDATEDNESS_REPORT_PATH):
            with open(OUTDATEDNESS_REPORT_PATH, "r") as f:
                old_report = json.load(f)
            for p in paths:
                old_report[p] = paths[p]
        else:
            old_report = paths
        with open(OUTDATEDNESS_REPORT_PATH, "w") as f:
            json.dump(old_report, f, indent=2)


__all__ = ["report_outdatedness", "run_job", "main"]
