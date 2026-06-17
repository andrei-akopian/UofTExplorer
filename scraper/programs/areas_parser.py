import os
import time
import logging
import json
import bs4

CACHE_DIR = "scraper/programs/cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
SAVE_NAME = "areas.json"
SAVE_PATH = f"{CACHE_DIR}/{SAVE_NAME}"
LOG_DIR = "scraper/programs/logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)
AREAS_PATH = "scraper/programs/raw_output/areas.html"

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/areas_parser.log"),
        logging.StreamHandler(),
    ],
)

TEXT_SWAPS = {"\u00a0": " ", "\xa0": " ", "\u2014": "-", "\u200b": "", "\u2019": "'"}


def extract_area_links():
    with open(AREAS_PATH, "r") as f:
        areas_raw_file = f.read()
    soup = bs4.BeautifulSoup(areas_raw_file, "html.parser")

    articles = soup.find_all("article")
    if len(articles) == 0:
        raise ValueError("can't parse what I can't find")
    elif len(articles) > 1:
        logging.warning(
            f"Multiple article tags ({len(articles)}), search is ambiguous."
        )
    article = articles[0]

    tables = article.find_all("table")
    if len(tables) == 0:
        raise ValueError("can't parse what I can't find")
    all_atags = []
    for table in tables:
        found_atags = table.tbody.find_all("a")
        all_atags.extend(found_atags)

    logging.info(f"Found {len(all_atags)} <a> tags.")
    d = dict()
    for t in all_atags:
        area_name = str(t.string)
        for key in TEXT_SWAPS:
            area_name = area_name.replace(key, TEXT_SWAPS[key])
        assert area_name is not None
        rel_link = t.get("href")
        assert rel_link is not None
        d[area_name] = rel_link

    all_same = None
    if os.path.exists(SAVE_PATH):
        with open(SAVE_PATH, "r") as f:
            old_prase = json.load(f)
        old_rel_links = set(old_prase.values())
        all_same = all(value in old_rel_links for value in d.values())

    if all_same is None or all_same == False:
        SAVE_PATH = f"{CACHE_DIR}/areas.json"
        with open(SAVE_PATH, "w") as f:
            json.dump(d, f, indent=1)
        logging.info(f"Saved to {SAVE_PATH}")
        if all_same is not None:
            logging.info(f"(overwrote old {SAVE_NAME} file, with updated changes)")
    else:
        logging.info(f"no changes to area listings since last crape")


if __name__ == "__main__":
    extract_area_links()
    pass
