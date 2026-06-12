from .dataset_eda_pure import run_all
from .global_statistics import run_global_statistics
from .sanity import nsquare_cyclechecker
from datetime import datetime
import os


def recompute_stats():
    run_all()
    run_global_statistics()
    nsquare_cyclechecker()


def stats_outdatedness():
    today = datetime.today()
    print(
        f"= Stats outdatedness report {today}: (note, negative results are shown, what wasn't mentioned, wasn't checked.)"
    )
    # courses
    paths = [
        "data/global_statistics.json",
        "frontend/src/assets/globalstats",
        "data_analysis/sanity_report.log",
    ]
    for p in paths:
        if not os.path.exists(p):
            print(f"{p} does not exist")
        else:
            mtime = datetime.fromtimestamp(os.path.getmtime(p))
            delta = today - mtime
            print(
                p,
                "last modified:\n\t",
                mtime,
                f"({delta} ago)",
            )
