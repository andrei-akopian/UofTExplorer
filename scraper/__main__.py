import scraper.synthesizer as synthesizer
from scraper.courses.course_parser import CourseParser
from scraper.courses.course_scraper import full_scrape
from scraper.courses.ttb_scraper import scrape_everything  # TODO rename everything here
from scraper.courses.ttb_parser import full_parse
from scraper.programs.program_parser import ProgramParser
from scraper.programs.artsci_program_scraper import full_scrape as full_scrape_artsci_programs
from scraper.glossary.glossary_parser import parse_glossary
from scraper.glossary.glossary_scraper import scrape_glossary
import sys

def getYorN(text) -> bool:
    return input(text)[0].lower() == "y"

def main():
    argv = sys.argv
    auto = False
    if len(argv) > 1:
        auto = argv[2] == "-R"
        print("TODO: auto move is not yet implemented.")
    if auto or getYorN("Run glossary scraper?:"):
        scrape_glossary()
    else:
        pass
    if auto or getYorN("Run glossary parser?:"):
        parse_glossary()
    else:
        pass
    if auto or getYorN("Run program scraper?:"):
        full_scrape_artsci_programs()
    else:
        pass
    if auto or getYorN("Run program parser?:"):
        pp = ProgramParser()
        pp.full_scrape_parse()
    else:
        pass
    if auto or getYorN("Run course scraper?:"):
        full_scrape()
    else:
        pass
    if auto or getYorN("Run course parser?:"):
        cp = CourseParser(log_to_file=True)
        cp.full_parse()
    else:
        pass
    if auto or getYorN("Run ttb scraper?:"):
        scrape_everything()
    else:
        pass
    if auto or getYorN("Run ttb parser?:"):
        full_parse()
    else:
        pass
    if auto or getYorN("Run synthesizer?:"):
        synthesizer.full_sync()
    else:
        pass

if __name__ == "__main__":
    main()