from .dataset_eda_pure import run_all
from .global_statistics import run_global_statistics
from .sanity import nsquare_cyclechecker
from datetime import datetime
import os
import json

OUTDATEDNESS_REPORT_PATH = "data/outdatedness_report.json"


def recompute_stats():
    run_all()
    run_global_statistics()
    nsquare_cyclechecker()


def stats_outdatedness(save=True):
    today = datetime.today()
    print(
        f"= Stats outdatedness report {today}: (note, negative results are shown, what wasn't mentioned, wasn't checked.)"
    )
    # courses
    paths = {
        "data/global_statistics.json": 0,
        "frontend/src/assets/globalstats": 0,
        "data_analysis/sanity_report.log": 0,
    }
    for p in paths:
        if not os.path.exists(p):
            print(f"{p} does not exist")
        else:
            if os.path.isdir(p):
                fp = f"{p}/{os.listdir(p)[0]}"
            else:
                fp = p
            mts = os.path.getmtime(fp)
            mtime = datetime.fromtimestamp(mts)
            delta = today - mtime
            print(
                p,
                "last modified:\n\t",
                mtime,
                f"({delta} ago)",
            )
            paths[p] = mts
    if save:
        if os.path.exists(OUTDATEDNESS_REPORT_PATH):
            with open(OUTDATEDNESS_REPORT_PATH, "r") as f:
                old_report = json.load(f)
            for p in paths:
                old_report[p] = paths[p]
        else:
            old_report = paths
        with open("data/outdatedness_report.json", "w") as f:
            json.dump(old_report, f, indent=2)
