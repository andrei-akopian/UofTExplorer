## Scraping Targets

https://artsci.calendar.utoronto.ca/search-courses (179 pages to scrape)

They have a "printer friendly option" `https://artsci.calendar.utoronto.ca/print/view/pdf/course_search/print_page/debug?page=178`. It takes their server a while to create but will be easier to make. Probably can be scraped overnight.

For reference, 179 pages takes 8 hours to scrape at 1 scrape / 3 minutes.

Porgrams and presumeably their requirements: 
- https://artsci.calendar.utoronto.ca/search-programs

The program requirements are hard to parse. We might need to resort to an LLM for this one.

https://ttb.utoronto.ca/
- The API can be reverse engineered

Scrape directly from Acorn using a chrome extension.