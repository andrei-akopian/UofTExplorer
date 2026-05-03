"""
CSC111 Winter 2026 Project 2

ACADEMIC CALENDAR COURSE SCRAPER
This module contains files to scrape University of Toronto Faculty of Arts & Science Academic Calendar Course pages.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

import os
import time
import requests


SCRAPING_TARGETS: dict[str, dict] = {
    "UTM": {
        "base_domain_name": "https://utm.calendar.utoronto.ca/course-search?page=PAGE_NUMBER",
        "page_range": range(0, 81 + 1)
    },
    "UTSG": {
        "base_domain_name": "https://artsci.calendar.utoronto.ca/search-courses?page=PAGE_NUMBER",
        "page_range": range(0, 178 + 1)
    },
    "Engineering": {  # Warning: we do not have parsers for this
        "base_domain_name": "https://engineering.calendar.utoronto.ca/search-courses?page=PAGE_NUMBER",
        "page_range": range(0, 18 + 1)
    },
    "UTSC": {
        "base_domain_name": "https://utsc.calendar.utoronto.ca/search-courses?page=PAGE_NUMBER",
        "page_range": range(0, 72 + 1)
    },
}

SAVE_PATH: str = "raw_output/"
SCRAPE_DELAY: int = 3  # in seconds. wait between hitting the endpoint


def scrape_page(base_domain_name: str, page: int = 0, target_name: str = "") -> str:
    """
    Scrape a specific page of the targets Course Catalogue, and save the HTML file.
    Assumes the SAVE_PATH directory already exists and ready for writing.
    """
    website_name = base_domain_name.replace("PAGE_NUMBER", str(page))
    r = requests.get(website_name)
    if r.status_code != 200:
        print(f"encountered unexpected HTTP response code: {r.status_code}. Exiting.")
        exit()
    with open(SAVE_PATH + f"page_{page}_{target_name}.html", 'w', encoding="utf-8") as f:
        f.write(r.text)
    return r.text


def full_scrape() -> None:
    """
    Aid the user in selecting a scraping target, and scrape all pages from its course search.
    Store those pages to the SAVE_PATH directory (created if it doesn't exist already.)
    Lastly confirm that all pages with results have been scraped,
    by checking that the next page out of range is empty.
    """
    if not os.path.isdir(SAVE_PATH):
        os.mkdir(SAVE_PATH)

    target = "UTSG"
    print(
        """Select Scrapping Target:
        (1) UTSG ArtSci - default
        (2) UTSC
        (3) UTM"""
    )
    selection = input("Enter>").strip()
    if selection.isdigit() and 1 <= int(selection) <= 3:
        target = ["UTSG", "UTSC", "UTM"][int(selection) - 1]
    else:
        print("selection interpreted as default.")

    base_domain_name = SCRAPING_TARGETS[target]["base_domain_name"]
    page_range = SCRAPING_TARGETS[target]["page_range"]

    print(f"Scraping pages {page_range} from {target}.")
    start = time.time()
    for p in page_range:
        response_text = scrape_page(base_domain_name, p, target.lower())
        assert "<h3>Your search yielded no results.</h3>" not in response_text
        now = time.time()
        print(
            f"[{round(time.time(), 3):<014}] Scraping page={p}, {round(p / len(page_range) * 100, 1)}% done."
            + f" remaining={round((len(page_range) - p) * (p + 1) / (now - start))}s"
        )
        time.sleep(SCRAPE_DELAY)

    # confirm that all interesting pages have been scrapped
    assert "<h3>Your search yielded no results.</h3>" in scrape_page(base_domain_name, len(page_range))
    print(f"All pages scraped successfully. Results are in {SAVE_PATH} folder.")


if __name__ == "__main__":
    full_scrape()
