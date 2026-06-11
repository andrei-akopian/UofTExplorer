import argparse
from scraper import scraperui, report_outdatedness
from server import start_server
import subprocess

def argparser():
    parser = argparse.ArgumentParser(
        prog='UofTExplorer CLI',
        description='CLI to run scrapes, parsers, start server, etc.',
        epilog='Repo: https://github.com/andrei-akopian/UofTExplorer')
    parser.add_argument("--build", action='store_true', help="Build frontend.")
    parser.add_argument("--serve", action='store_true', help="Start flask server.")
    parser.add_argument("--status", action='store_true', help="See status of scrapes.")
    parser.add_argument("--scrape", action='store_true', help="Run scrape UI.")
    parser.add_argument("--docker", action='store_true', help="Ensure server is on 0.0.0.0 (necessary for docker.)")
    args = parser.parse_args()
    return args

def main():
    args = argparser()
    if args.status or args.serve:
        report_outdatedness()
    if args.build:
        print("not recommended to build via server cli\nBuilding frontend.")
        result = subprocess.run(["npm", "run", "build"], cwd="frontend", capture_output=True, text=True)
        print(result.stdout)   # command output
        print(result.stderr)   # errors (if any)
        print(result.returncode)  # 0 = success
    if args.scrape:
        scraperui()
    if args.serve:
        if args.docker:
            start_server(host="0.0.0.0")
        else:
            start_server()
    pass

if __name__ == "__main__":
    main()