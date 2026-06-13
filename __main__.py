import argparse
from server import start_server

try:
    from scraper import scraperui, report_outdatedness
    from data_analysis import stats_outdatedness, recompute_stats
except:
    message = lambda: print(
        "sorry, you are trying to use a module that was excluded from this docker build."
    )
    scraperui = message
    report_outdatedness = message
    stats_outdatedness = message
    recompute_stats = message

import subprocess
import sys


def argparser():
    parser = argparse.ArgumentParser(
        prog="UofTExplorer CLI",
        description="CLI to run scrapes, parsers, start server, etc.",
        epilog="Repo: https://github.com/andrei-akopian/UofTExplorer",
    )
    parser.add_argument("--build", action="store_true", help="Build frontend.")
    parser.add_argument("--serve", action="store_true", help="Start flask server.")
    parser.add_argument("--status", action="store_true", help="See status of scrapes.")
    parser.add_argument("--scrape", action="store_true", help="Run scrape UI.")
    parser.add_argument(
        "--recomp-stats",
        action="store_true",
        help="Recompute statistics, and make new graph images.",
    )
    parser.add_argument(
        "--docker",
        action="store_true",
        help="Ensure server is on 0.0.0.0 (necessary for docker.)",
    )
    args = parser.parse_args()
    return args, parser


def main():
    args, parser = argparser()
    if len(sys.argv) <= 1:
        parser.print_help()
        exit(0)
    if args.status or (args.serve and not args.docker):
        report_outdatedness()
        stats_outdatedness()
    if args.build:
        print("not recommended to build via server cli\nBuilding frontend.")
        result = subprocess.run(
            ["npm", "run", "build"], cwd="frontend", capture_output=True, text=True
        )
        print(result.stdout)  # command output
        print(result.stderr)  # errors (if any)
        print(result.returncode)  # 0 = success
    if args.scrape:
        scraperui()
        recompute_stats()
    elif args.recomp_stats:
        recompute_stats()
    if args.serve:
        if args.docker:
            start_server(host="0.0.0.0")
        else:
            start_server()
    pass


if __name__ == "__main__":
    main()
