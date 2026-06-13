"""
TODO hook up to main scraping loop
TODO clean up
"""

import requests
import logging
import os

CACHE_DIR = "scraper/programs/cache"
LOG_DIR = "scraper/programs/logs"
OUTPUT_DIR = "scraper/programs/raw_output"

if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)
if not os.path.exists(CACHE_DIR):
    os.makedirs(OUTPUT_DIR)

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/artsci_program_area_scraper.log"),
        logging.StreamHandler(),
    ],
)

AREAS_PAGE = "https://artsci.calendar.utoronto.ca/listing-program-subject-areas"


def get_index_page():
    response = requests.get(AREAS_PAGE)
    if response.status_code != 200:
        logging.critical("Failed to get areas listing page.")
        exit(1)
    else:
        savepath = f"{OUTPUT_DIR}/areas.html"
        with open(savepath, "w") as f:
            f.write(response.text)
        logging.info(f"Scraped areas page successfully to {savepath}")
    return


if __name__ == "__main__":
    get_index_page()
