import os
import time
import logging
import requests
import json
import bs4

CACHE_DIR = "scraper/programs/cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
LOG_DIR = "scraper/programs/logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)
OUTPUT_DIR = "scraper/programs/raw_output"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)
AREAS_JSON = "scraper/programs/cache/areas.json"

BASE_URL = "https://artsci.calendar.utoronto.ca/"

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/areas_parser.log"),
        logging.StreamHandler(),
    ],
)

TEXT_SWAPS = {"\u00a0": " ", "\xa0": " ", "\u2014": "-", "\u200b": "", "\u2019": "'"}


def scrape_areas():
    if not os.path.exists(AREAS_JSON):
        raise FileNotFoundError(f"Can't find {AREA_JSON}")
    with open(AREAS_JSON, "r") as f:
        areas = json.load(f)
    for i, (title, rel_link) in enumerate(areas.items()):
        scrape_area_banner(i, title, rel_link)


def scrape_area_banner(i, title, rel_link):
    time.sleep(3)
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception("Status code 200")
    savepath = f"{OUTPUT_DIR}/area_{i}.html"
    with open(savepath, "w") as f:
        f.write(response.text)
    logging.info(f"area {title} saved to {savepath}")


if __name__ == "__main__":
    scrape_areas()
