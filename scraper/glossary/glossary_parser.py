"""
CSC111 Winter 2026 Project 2

GLOSSARY PARSER
This Python module provides functions for parsing the scraped glossary file.

The HTML is read from LOADPATH constant, and the final json lookup table is saved to SAVEPATH constant path.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

import json
import bs4

LOADPATH = "scraper/glossary/raw_output/glossary.html"
SAVEPATH = "scraper/data/glossary.json"

TEXT_SWAPS = {"\u00a0": " ", "\u2014": "-", "\u200b": "", "\u2019": "'"}


def clean_unicodes(text) -> str:
    """
    Repalce Unicode characters with their ASCII versions.
    """
    for key in TEXT_SWAPS:
        text = text.replace(key, TEXT_SWAPS[key])
    return text.strip()


def parse_table(table: bs4.Tag | bs4.PageElement) -> dict[str, str]:
    """
    Parse a table section of the html.
    The HTML table contains codes on the first column, and department names in the second.
    """
    course_codes: dict[str, str] = {}
    for entry in table.tbody.find_all("tr"):
        course_code = clean_unicodes(entry.contents[0].string)
        department = clean_unicodes(entry.contents[1].string)
        course_codes[course_code] = department
    return course_codes


def parse_glossary() -> dict[str, str]:
    """
    Parse the HTML glossary page, and store the output.
    """
    with open(LOADPATH, "r") as f:
        html_doc = f.read()

    soup = bs4.BeautifulSoup(html_doc, "html.parser")

    tables = soup.find_all("table")

    primary_course_codes_table = tables[0]
    join_course_codes_table = tables[1]

    course_codes = {}
    course_codes.update(parse_table(primary_course_codes_table))
    course_codes.update(parse_table(join_course_codes_table))

    with open(SAVEPATH, "w") as f:
        json.dump(course_codes, f, indent=1)

    return course_codes


def glossary_notice() -> bool:
    print(
        "Notice: the glossary source does not update and is incomplete, so re-parsing is pointless.\n"
        "missing course codes to glossary.json in this respoitory was extended by hand, and might get overwritten."
    )
    user = input("Run anyway y/(n)?:")
    return len(user) > 0 and user[0].lower() == "y"


if __name__ == "__main__":
    if glossary_notice():
        parse_glossary()
