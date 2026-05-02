"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

SERVER
This Python module connects to the frontend and contains functions that are related to visualizations.
Flask is used to connect the Python functions to JavaScript.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
This file was written with the help of ChatGPT codex GPT-5.4.
"""
import os
import socket
import json
import time
import uuid
import threading
from typing import Any
from flask import Flask, Response, request, jsonify, render_template, send_from_directory
from flask.typing import ResponseReturnValue

from core import sat
from core.constructor import construct_container, construct_subgraph
from core.algorithms import (get_course_suggestions, get_filtered_graph, get_search_suggestions, traversers)
from core.deconstructor import deconstruct_course_graph

app = Flask(__name__, template_folder="./templates")

DATA_FOLDER = "./data"
COURSE_GRAPH_CONTAINER = construct_container(f"{DATA_FOLDER}/courses.json",
                                             f"{DATA_FOLDER}/programs.json",
                                             f"{DATA_FOLDER}/glossary.json",
                                             f"{DATA_FOLDER}/breadths.json")

# Progress tracking for long-running requests
PROGRESS_TRACKER = {}

MAX_RESULTS = {"departments": 20, "programs": 4, "courses": 36}

DEFAULT_QUERY = "MAT332H1"
DEFAULT_QUERY_SNAPSHOT = {"type": "", "code": "", "name": ""}
# type can be {"course", "program", "department", "all", ""}
# code is the actual code
# name is

IMAGE_PATHS = [
    "data_analysis/images"
]


def get_global_statistics_from_file() -> dict[str, int | float]:
    """
    Load precomputed global statistics from data/global_statistics.json.
    Used by /globalstats endpoint to reender tempalte for the globalstats.html page.
    """
    stats_path = f"{DATA_FOLDER}/global_statistics.json"
    with open(stats_path, "r", encoding="utf-8") as file:
        return json.load(file)


@app.route('/')
def index() -> ResponseReturnValue:
    """
    Return the data to be used to render the home page.
    """
    app.logger.info("Processed request for homepage (/) and sent response.")

    # Get global statistics from precomputed JSON file
    return render_template('index.html')


@app.route('/2dgraph')
def graph2d() -> ResponseReturnValue:
    """
    Return the data to be used to render the 2d graph.
    """
    search = request.args.get('search')
    app.logger.info("Processing Request for / root (index.html - 2d graph)")

    if search != "" and search is not None:
        graph_data = graph_for_query(search)
    else:
        graph_data = graph_for_query(DEFAULT_QUERY)
    app.logger.info("... and sending response.")

    return render_template(
        '2dgraph.html',
        data=graph_data,
        departments=COURSE_GRAPH_CONTAINER.departments,
        breadth=COURSE_GRAPH_CONTAINER.breadths,
        current_query=DEFAULT_QUERY_SNAPSHOT
    )


@app.route('/3dforcegraph')
def forcegraph3d() -> ResponseReturnValue:
    """
    Return the data to be used to render the 3d graph.
    """
    search = request.args.get('search')
    app.logger.info("Processing Request for /3dforcegraph")

    if search != "" and search is not None:
        graph_data = graph_for_query(search)
    else:
        graph_data = graph_for_query(DEFAULT_QUERY)
    app.logger.info("... and sending response.")

    return render_template(
        '3dforcegraph.html',
        data=graph_data,
        departments=COURSE_GRAPH_CONTAINER.departments,
        breadth=COURSE_GRAPH_CONTAINER.breadths,
        current_query=DEFAULT_QUERY_SNAPSHOT
    )


@app.route('/pathexplorer')
def path_explorer() -> ResponseReturnValue:
    """
    Return the data to be used to render the Path Explorer page.
    """
    return render_template(
        "pathexplorer.html"
    )


@app.route('/globalstats')
def globalstats() -> ResponseReturnValue:
    """
    Return the data to be used to render the Global Statistics page.
    """
    app.logger.info("Processed request for /globalstats and sent response.")
    statistics = get_global_statistics_from_file()
    print(statistics)
    return render_template('globalstats.html', statistics=statistics)


@app.route('/pathexplorerplanning', methods=["POST"])
def pathexplorerplanning() -> ResponseReturnValue:
    """
    Endpoint for the path explorer page request payload.
    Returns job_id immediately, runs solver in background thread.
    """
    try:
        request_data = request.get_json(silent=True) or {}
        completed_courses = request_data.get("completed_courses", [])
        desired_courses = request_data.get("desired_courses", [])
        avoided_courses = request_data.get("avoided_courses", [])
        job_id = request_data.get("job_id", str(uuid.uuid4()))

        app.logger.info(
            "Received path explorer request: job_id=%s completed=%s desired=%s avoided=%s",
            job_id,
            completed_courses,
            desired_courses,
            avoided_courses
        )

        # Initialize progress tracking
        PROGRESS_TRACKER[job_id] = {
            "status": "starting",
            "case_bits": "",
            "dimension": 0,
            "warning": None,
            "cancelled": False,
            "start_time": time.time()
        }

        # Start solver in background thread
        solver_thread = threading.Thread(
            target=_solve_in_background,
            args=(job_id, completed_courses, desired_courses, avoided_courses),
            daemon=True
        )
        solver_thread.start()

        # Return immediately with job_id
        return jsonify({"job_id": job_id}), 202

    except Exception as e:
        app.logger.warning(e)
        return jsonify({"error": "Internal error"}), 500


def _solve_in_background(job_id: str, completed_courses: list[str], desired_courses: list[str],
                         avoided_courses: list[str]) -> None:
    """
    Background worker function that runs the SAT solver and stores results in PROGRESS_TRACKER.
    """
    try:
        # Update progress: computing fundamentals
        PROGRESS_TRACKER[job_id]["status"] = "computing_fundamentals"

        # Define progress callback for brute-force solver
        def update_bruteforce_progress(curr: list[int], dimension: int) -> None:
            """Callback to update progress during brute-force solving with pruning"""
            if job_id in PROGRESS_TRACKER:
                # Check if user cancelled
                if PROGRESS_TRACKER[job_id].get("cancelled", False):
                    raise RuntimeError("Solving cancelled by user")
                # Convert case array to binary string for display (e.g., "10110101")
                case_bits = "".join(map(str, curr))
                PROGRESS_TRACKER[job_id]["status"] = "solving"
                PROGRESS_TRACKER[job_id]["case_bits"] = case_bits
                PROGRESS_TRACKER[job_id]["dimension"] = dimension

        solver = sat.solve_sat(COURSE_GRAPH_CONTAINER.graph, desired_courses, completed_courses,
                               avoided_courses, progress_callback=update_bruteforce_progress)

        num_fundamentals = next(solver)
        # Set dimension immediately after computing fundamentals
        PROGRESS_TRACKER[job_id]["dimension"] = num_fundamentals
        PROGRESS_TRACKER[job_id]["status"] = "solving"

        # Check for warning and set it immediately (before solving)
        warning = None
        if num_fundamentals > 20:
            warning = "This evaluation requires testing more than 20 courses, which may take a long time to complete."
            PROGRESS_TRACKER[job_id]["warning"] = warning

        solution = next(solver)
        solution_selection = {str(course): course for course in solution}
        target_selection = {tar: COURSE_GRAPH_CONTAINER.graph.courses[tar] for tar in desired_courses}
        origins = {str(course) for course in solution_selection}
        for tar in target_selection:
            origins.add(tar)

        subgraph = construct_subgraph(COURSE_GRAPH_CONTAINER.graph, list(origins),
                                      traversers.Targets(True, True, False, False))
        graph_data = deconstruct_course_graph(subgraph, solution_selection, target_selection)

        # Add display text for target courses (desired courses)
        solution_display = {
            code: f"{code}: {course.data.title}"
            for code, course in solution_selection.items()
        }
        graph_data["solution_display"] = solution_display

        # Store results in progress tracker
        PROGRESS_TRACKER[job_id]["status"] = "complete"
        PROGRESS_TRACKER[job_id]["graph_data"] = graph_data
        PROGRESS_TRACKER[job_id]["warning"] = warning
        PROGRESS_TRACKER[job_id]["num_fundamentals"] = num_fundamentals

        app.logger.warning("%s", solution_selection)

    except RuntimeError as e:
        if "cancelled" in str(e).lower():
            PROGRESS_TRACKER[job_id]["status"] = "cancelled"
        else:
            PROGRESS_TRACKER[job_id]["status"] = "error"
            PROGRESS_TRACKER[job_id]["error"] = str(e)
    except Exception as e:
        PROGRESS_TRACKER[job_id]["status"] = "error"
        PROGRESS_TRACKER[job_id]["error"] = str(e)
        app.logger.warning(e)


@app.route('/pathexplorer_cancel/<job_id>', methods=["POST"])
def pathexplorer_cancel(job_id: str) -> ResponseReturnValue:
    """
    Endpoint to cancel a path explorer planning request.
    """
    if job_id not in PROGRESS_TRACKER:
        return jsonify({"error": "Job not found"}), 404

    PROGRESS_TRACKER[job_id]["cancelled"] = True
    return jsonify({"status": "cancel_requested"}), 200


@app.route('/pathexplorer_progress/<job_id>', methods=["GET"])
def pathexplorer_progress(job_id: str) -> ResponseReturnValue:
    """
    Endpoint to check progress of a path explorer planning request.
    Returns case bits during solving, and full graph data when complete.
    """
    if job_id not in PROGRESS_TRACKER:
        return jsonify({"error": "Job not found"}), 404

    progress_data = PROGRESS_TRACKER[job_id]
    response = {
        "job_id": job_id,
        "status": progress_data.get("status", "unknown"),
        "case_bits": progress_data.get("case_bits", ""),
        "dimension": progress_data.get("dimension", 0),
        "warning": progress_data.get("warning"),
        "error": progress_data.get("error")
    }

    # Include graph data and metadata when complete
    if progress_data.get("status") == "complete":
        response.update({
            **progress_data.get("graph_data", {}),
            "num_fundamentals": progress_data.get("num_fundamentals", 0)
        })

    return jsonify(response), 200


@app.route("/get_immediate_postreqs", methods=["POST"])
def get_immediate_postreqs() -> ResponseReturnValue:
    """
    Return a deconstructed graph showing immediate post-requisites for completed courses.
    """
    try:
        request_data = request.get_json(silent=True) or {}
        completed_courses = request_data.get("completed_courses", [])

        if not completed_courses:
            return jsonify({"error": "No completed courses provided"}), 400

        app.logger.info("Processing immediate postreqs request for courses: %s", completed_courses)

        # Build origins set with completed courses
        origins = {x['code']: COURSE_GRAPH_CONTAINER.graph.courses[x['code']] for x in completed_courses}

        # Construct subgraph with completed courses
        postreqs = COURSE_GRAPH_CONTAINER.graph.get_satisfied_courses(list(origins.values()))
        subgraph = construct_subgraph(COURSE_GRAPH_CONTAINER.graph, list(postreqs.keys()),
                                      traversers.Targets(True, True, False, False))

        # Create selections for deconstruction
        solution_selection = postreqs.copy()
        target_selection = origins.copy()

        # Deconstruct the graph
        graph_data = deconstruct_course_graph(subgraph, solution_selection, target_selection)

        # Add display text for target courses (completed courses)
        solution_display = {
            code: f"{code}: {course.data.title}"
            for code, course in solution_selection.items()
        }
        graph_data["solution_display"] = solution_display

        return jsonify(graph_data), 200

    except Exception as e:
        app.logger.warning("Error in get_immediate_postreqs: %s", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/suggest", methods=["POST"])
def suggest() -> ResponseReturnValue:
    """
    Return search suggestions for the current query, including departments, programs, and courses.
    """
    try:
        data = request.get_json()
        query = (data or {}).get("q", "").strip().upper()

        if not query or len(query) < 2:
            return jsonify({"results": []})

        matches = get_search_suggestions(COURSE_GRAPH_CONTAINER, query, MAX_RESULTS)

        return jsonify({"results": matches})

    except Exception as e:
        return jsonify({"results": [], "error": "Internal error"}), 500


@app.route("/suggest_courses", methods=["POST"])
def suggest_courses() -> ResponseReturnValue:
    """
    Return search suggestions for the current query, including only courses.
    """
    try:
        data = request.get_json()
        query = (data or {}).get("q", "").strip().upper()

        if not query or len(query) < 2:
            return jsonify({"results": []})

        matches = get_course_suggestions(COURSE_GRAPH_CONTAINER, query)[:MAX_RESULTS["courses"]]

        return jsonify({"results": matches})

    except Exception as e:
        return jsonify({"results": [], "error": "Internal error"}), 500


@app.route("/courseinformation", methods=["POST"])
def courseinformation() -> ResponseReturnValue:
    """
    Return all information about a course, to be displayed in the sidebar.
    """
    try:
        data = request.get_json(silent=True) or {}
        query = data.get("course", "").strip().upper()
        app.logger.info("Course information request for %s", query)

        info = COURSE_GRAPH_CONTAINER.get_information(query)

        if info == {"results": [], "error": "Invalid Course Code"}:
            return jsonify(info), 500
        else:
            return jsonify(info), 200

    except Exception as e:
        app.logger.warning(e)
        return jsonify({"results": [], "error": "Internal error"}), 500


@app.route('/fetch_graph', methods=['POST'])
def fetch_graph() -> ResponseReturnValue:
    """
    Respond to a request to fetch a new graph.
    Return a json structure of the graph.
    """
    try:
        request_data = request.get_json(silent=True)
        app.logger.info("Processing fetch_graph request for %s", request_data)
        # Courtesy of Grok.com

        # === BAD INPUT HANDLING ===
        if not request_data or 'query' not in request_data:
            return jsonify({"error": "Bad request: 'query' field is required in the JSON body."}), 400

        # Get the search query
        query: str = str(request_data['query']).strip()

        # Get the chosen filters
        filters = {'cr_ncr': request_data['cr_ncr'],
                   'departments': request_data['departments'],
                   'breadth': request_data['breadth_requirements']}
        print(f"Processing Query for {query}, {filters['cr_ncr']}, {filters['departments']}, {filters['breadth']}")

        if not query:
            return jsonify({"error": "Query cannot be empty."}), 400

        graph_data = graph_for_query(query, filters)
        should_open_course_panel = graph_data["curr_query"]["type"] == "course"
        return jsonify({
            **graph_data,
            "should_open_course_panel": should_open_course_panel
        }), 200

    except Exception as e:
        # Generic server error
        print(e)
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


def graph_for_query(query: str, filters: dict[str, Any] = None) -> dict[str, list | str]:
    """
    Get graph data corresponding to a specific query, case-insensitive, given filters.
    Graph data already contains curr_query and search fields.

    Preconditions:
        - query is already formatted (no further edits needed, other than query.upper() or query.lower())
    """
    print(COURSE_GRAPH_CONTAINER)
    if filters is None:
        filters = {'cr_ncr': [],
                   'departments': [],
                   'breadth': []}

    filtered_graph = get_filtered_graph(COURSE_GRAPH_CONTAINER, query, filters)

    return filtered_graph


@app.route("/images/<path:filename>")
def images(filename: str) -> Response | None:
    """
    Scan the folders in IMAGE_PATHS for the requested image, and return the requested image.
    Return None if the image is not in the folders.
    """
    for path in IMAGE_PATHS:
        print(os.listdir(path), filename in os.listdir(path), f"./{path}/{filename}", os.path.exists(f"./{path}/{filename}"))
        if os.path.exists(f"./{path}/{filename}"):
            return send_from_directory("../data_analysis/images", filename)

    return None


def find_port() -> int:
    """
    Find an open port for the Flask server to use.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", 5000))
            return 5000
        except OSError:
            s.bind(("127.0.0.1", 0))
            return s.getsockname()[1]


def start_server() -> None:
    """
    Start the Flask server on an open port, and print the URL to access it.
    """
    port = find_port()
    print(flush=True)
    print(f"http://127.0.0.1:{port}/")
    app.run(debug=True, port=port)


if __name__ == '__main__':
    start_server()
