"""
CSC111 Winter 2026 Project 2

GLOSSARY_SCRAPER
This Python module that scrapes a University of Toronto webpage containing a glossary
of department 3 letter codes (e.g. CSC - Computer Science).

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

import os
import requests

GOLSSARY_URL = ("https://www.sgs.utoronto.ca/policies-guidelines/"
                + "glossary-of-course-codes-primary-and-joint-course-codes/")
SAVE_PATH = "raw_output/"


def scrape_glossary() -> None:
    """
    Aid the user in selecting a scraping target, and scrape all pages from its program search.
    Store those pages to the SAVE_PATH directory (created if it doesn't exist already.)
    Lastly confirm that all pages with results have been scraped,
    by checking that the next page out of range is empty.
    """
    if not os.path.isdir(SAVE_PATH):
        os.mkdir(SAVE_PATH)

    website_name = GOLSSARY_URL
    r = requests.get(website_name)
    if r.status_code != 200:
        print(f"scraping request returned with unexpected HTTP code: {r.status_code}")
        exit()
    filepath = SAVE_PATH + "glossary.html"
    with open(filepath, 'w', encoding="utf-8") as f:
        f.write(r.text)
    print("glossary scrape saved to", filepath)


if __name__ == "__main__":
    import doctest
    doctest.testmod(verbose=True)

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': ['requests', 'os'],
        'allowed-io': ['scrape_glossary'],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 20,
        'max-branches': 15,
        'max-args': 7
    })

    scrape_glossary()
