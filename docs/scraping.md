⬅️ [Back to Documentation Homepage](README.md)

---

# Scraping Guide

To stay up to date, UofTexplorer `data/` directory needs to be regularly updated by rescraping uoft websites (in particular, `ttb.utoronto.ca` and the faculty of arts and sciences academic calendar.)

To perform the scraping do

```bash
# in project root
python3 . --help
```

then

```bash
# run scrape process. it will ask for y/n confirmations for specific scrape targets.
python3 . --scrape
```

This will run a procedure scraping different targets, parsing them into json format, and finally throwing the into the `data/` directory.

Scraping has a built in delay for a few seconds between requests, to make sure you don't get rate limited and IP banned.

## Code Maintenance

For HTML + bs4 academic calendar scraper.

Scraper code lives in `scraper`. The page ranges for scraping programs and courses are hardcoded in `SCRAPING_TARGETS` constants. These might need to be updated as the quantity of courses changes.

For ttb scraper, everything lives in `scraper/courses` and then the `synthesizer.py` combines calendar and ttb information to remove dead / non-existant course codes (of which there are many).
